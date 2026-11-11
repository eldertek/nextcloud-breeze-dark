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

    function post(data) {
        const body = new URLSearchParams();
        Object.keys(data).forEach(function (key) {
            body.append(key, data[key]);
        });

        return fetch(OC.generateUrl("apps/breezedark/settings"), {
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

        anchor.append(document.createTextNode(" "), message);

        setTimeout(function () {
            message.remove();
        }, 3000);
    }

    function isChecked(id) {
        const element = document.getElementById(id);
        return element !== null && element.checked ? 1 : 0;
    }

    function savePersonalSettings(data, selector, id) {
        post(data)
            .then(function () {
                showMessage(selector, id, "success");
            })
            .catch(function () {
                showMessage(selector, id, "error");
            });
    }

    function init() {
        const themeEnabled = document.getElementById("breezedark-enabled");
        const automaticActivation = document.getElementById(
            "breezedark-automatic-activation-enabled"
        );

        if (themeEnabled !== null) {
            themeEnabled.addEventListener("change", function () {
                savePersonalSettings(
                    {
                        theme_enabled: this.checked ? 1 : 0,
                        theme_automatic_activation_enabled: isChecked(
                            "breezedark-automatic-activation-enabled"
                        ),
                    },
                    "label[for='breezedark-enabled']",
                    "breezedark-enabled-msg"
                );
            });
        }

        if (automaticActivation !== null) {
            automaticActivation.addEventListener("change", function () {
                savePersonalSettings(
                    {
                        theme_enabled: isChecked("breezedark-enabled"),
                        theme_automatic_activation_enabled: this.checked ? 1 : 0,
                    },
                    "label[for='breezedark-automatic-activation-enabled']",
                    "breezedark-automatic-activation-enabled-msg"
                );
            });
        }
    }

    if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
