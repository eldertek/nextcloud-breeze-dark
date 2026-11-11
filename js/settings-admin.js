/**
 * Breeze Dark theme for Nextcloud
 *
 * @copyright Copyright (C) 2020  Magnus Walbeck <mw@mwalbeck.org>
 *
 * @author Magnus Walbeck <mw@mwalbeck.org>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

(function () {
    "use strict";

    function post(url, data) {
        const body = new URLSearchParams();
        Object.keys(data).forEach(function (key) {
            body.append(key, data[key]);
        });

        return fetch(OC.generateUrl(url), {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                requesttoken: OC.requestToken,
            },
            body: body.toString(),
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Request failed with status " + response.status);
            }
            return response;
        });
    }

    function showMessage(selector, id, type) {
        const anchor = document.querySelector(selector);
        if (anchor === null) {
            return;
        }

        const previous = document.getElementById(id);
        if (previous !== null) {
            previous.remove();
        }

        const message = document.createElement("span");
        message.id = id;
        message.className = "msg " + type;
        message.textContent = t("breezedark", type === "success" ? "Saved" : "Error");

        anchor.after(document.createTextNode(" "), message);

        setTimeout(function () {
            message.remove();
        }, 3000);
    }

    function postSuccess(selector, id) {
        showMessage(selector, id, "success");
    }

    function postError(selector, id) {
        showMessage(selector, id, "error");
    }

    function isChecked(id) {
        const element = document.getElementById(id);
        return element !== null && element.checked ? 1 : 0;
    }

    function saveAdminSettings(data, selector, id) {
        post("apps/breezedark/settings/admin", data)
            .then(function () {
                postSuccess(selector, id);
            })
            .catch(function () {
                postError(selector, id);
            });
    }

    function init() {
        const themeEnabled = document.getElementById("breezedark-theme-enabled");
        const automaticActivation = document.getElementById(
            "breezedark-automatic-activation-enabled"
        );
        const loginPage = document.getElementById("breezedark-theme-login-page");
        const customStyling = document.getElementById("breezedark-theme-custom-styling");
        const customStylingButton = document.getElementById(
            "breezedark-theme-custom-styling-button"
        );

        if (themeEnabled !== null) {
            themeEnabled.addEventListener("change", function () {
                saveAdminSettings(
                    {
                        theme_enforced: this.checked ? 1 : 0,
                        theme_automatic_activation_enabled: isChecked(
                            "breezedark-automatic-activation-enabled"
                        ),
                        theme_login_page: isChecked("breezedark-theme-login-page"),
                    },
                    "label[for='breezedark-theme-enabled']",
                    "breezedark-theme-enabled-msg"
                );

                if (automaticActivation !== null) {
                    automaticActivation.disabled = !this.checked;
                }
            });
        }

        if (automaticActivation !== null) {
            automaticActivation.addEventListener("change", function () {
                saveAdminSettings(
                    {
                        theme_enforced: isChecked("breezedark-theme-enabled"),
                        theme_automatic_activation_enabled: this.checked ? 1 : 0,
                        theme_login_page: isChecked("breezedark-theme-login-page"),
                    },
                    "label[for='breezedark-automatic-activation-enabled']",
                    "breezedark-theme-automatic-activation-enabled-msg"
                );
            });
        }

        if (loginPage !== null) {
            loginPage.addEventListener("change", function () {
                saveAdminSettings(
                    {
                        theme_enforced: isChecked("breezedark-theme-enabled"),
                        theme_automatic_activation_enabled: isChecked(
                            "breezedark-automatic-activation-enabled"
                        ),
                        theme_login_page: this.checked ? 1 : 0,
                    },
                    "label[for='breezedark-theme-login-page']",
                    "breezedark-theme-login-page-msg"
                );
            });
        }

        if (customStylingButton !== null && customStyling !== null) {
            customStylingButton.addEventListener("click", function () {
                post("apps/breezedark/settings/custom-styling", {
                    theme_custom_styling: customStyling.value,
                })
                    .then(function () {
                        postSuccess(
                            "#breezedark-theme-custom-styling-button",
                            "breezedark-theme-custom-styling-button-msg"
                        );
                    })
                    .catch(function () {
                        postError(
                            "#breezedark-theme-custom-styling-button",
                            "breezedark-theme-custom-styling-button-msg"
                        );
                    });
            });
        }
    }

    if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
