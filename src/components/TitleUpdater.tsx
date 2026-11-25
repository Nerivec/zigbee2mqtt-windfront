import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { useAppStore } from "../store.js";
import { getValidSourceIdx } from "../utils.js";

const BASE_TITLE = "Zigbee2MQTT";

// Helper to convert text to title case
const toTitleCase = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Map device page tabs to translation keys
const deviceTabTranslationMap: Record<string, string> = {
    info: "about",
    exposes: "exposes",
    bind: "bind",
    reporting: "reporting",
    settings: "settings",
    "settings-specific": "settings_specific",
    state: "state",
    clusters: "clusters",
    groups: "groups",
    scene: "scene",
    "dev-console": "dev_console",
};

export function TitleUpdater() {
    const location = useLocation();
    const { t: tNavbar } = useTranslation(["navbar"]);
    const devices = useAppStore((state) => state.devices);
    const groups = useAppStore((state) => state.groups);

    useEffect(() => {
        let pageTitle = BASE_TITLE;
        const pathname = location.pathname;

        if (pathname === "/" || pathname === "") {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.home)}`;
        } else if (pathname.includes("/dashboard")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.dashboard)}`;
        } else if (pathname.includes("/devices")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.devices)}`;
        } else if (pathname.includes("/device/")) {
            // Device detail page - extract params from pathname: /device/:sourceIdx/:deviceId/:tab?
            const deviceMatch = pathname.match(/\/device\/(\d+)\/([^/]+)(?:\/(.+))?/);
            if (deviceMatch) {
                const [sourceIdx] = getValidSourceIdx(deviceMatch[1]);
                const deviceId = deviceMatch[2];
                const tab = deviceMatch[3];

                if (deviceId && devices[sourceIdx]) {
                    const device = devices[sourceIdx].find((d) => d.ieee_address === deviceId);
                    if (device) {
                        let title = `${BASE_TITLE} - ${device.friendly_name}`;
                        if (tab && deviceTabTranslationMap[tab]) {
                            const translationKey = deviceTabTranslationMap[tab];
                            const translatedTab = tNavbar(($) => $[translationKey as keyof typeof $]);
                            title += ` - ${toTitleCase(translatedTab)}`;
                        }
                        pageTitle = title;
                    }
                }
            }
        } else if (pathname.includes("/groups")) {
            if (pathname.includes("/group/")) {
                // Group detail page - extract params from pathname: /group/:sourceIdx/:groupId/:tab?
                const groupMatch = pathname.match(/\/group\/(\d+)\/(\d+)(?:\/(.+))?/);
                if (groupMatch) {
                    const [sourceIdx] = getValidSourceIdx(groupMatch[1]);
                    const groupId = Number.parseInt(groupMatch[2], 10);
                    const tab = groupMatch[3];

                    if (groups[sourceIdx]) {
                        const group = groups[sourceIdx].find((g) => g.id === groupId);
                        if (group) {
                            let title = `${BASE_TITLE} - ${group.friendly_name}`;
                            if (tab && deviceTabTranslationMap[tab]) {
                                const translationKey = deviceTabTranslationMap[tab];
                                const translatedTab = tNavbar(($) => $[translationKey as keyof typeof $]);
                                title += ` - ${toTitleCase(translatedTab)}`;
                            }
                            pageTitle = title;
                        }
                    }
                }
            } else {
                pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.groups)}`;
            }
        } else if (pathname.includes("/reporting")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.reporting)}`;
        } else if (pathname.includes("/bindings")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.bindings)}`;
        } else if (pathname.includes("/ota")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.ota)}`;
        } else if (pathname.includes("/touchlink")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.touchlink)}`;
        } else if (pathname.includes("/network")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.network)}`;
        } else if (pathname.includes("/logs")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.logs)}`;
        } else if (pathname.includes("/activity")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.activity)}`;
        } else if (pathname.includes("/settings")) {
            // Settings page - extract params from pathname: /settings/:sourceIdx?/:tab?/:subTab?
            const settingsMatch = pathname.match(/\/settings(?:\/(\d+))?(?:\/([^/]+))?(?:\/(.+))?/);
            if (settingsMatch) {
                const tab = settingsMatch[2];
                const subTab = settingsMatch[3];

                let title = `${BASE_TITLE} - ${tNavbar(($) => $.settings)}`;

                if (tab) {
                    title += ` - ${toTitleCase(tab)}`;
                    if (subTab) {
                        title += ` - ${toTitleCase(subTab)}`;
                    }
                }
                pageTitle = title;
            } else {
                pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.settings)}`;
            }
        } else if (pathname.includes("/frontend-settings")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.frontend_settings)}`;
        } else if (pathname.includes("/contribute")) {
            pageTitle = `${BASE_TITLE} - ${tNavbar(($) => $.contribute)}`;
        }

        document.title = pageTitle;
    }, [location.pathname, devices, groups, tNavbar]);

    return null;
}
