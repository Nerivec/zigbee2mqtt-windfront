import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LabelVisibilityType, LayoutTypes } from "reagraph";
import store2 from "store2";
import ConfirmButton from "../components/ConfirmButton.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import NumberField from "../components/form-fields/NumberField.js";
import SelectField from "../components/form-fields/SelectField.js";
import type { NetworkRawDisplayType } from "../components/network-page/index.js";
import {
    AUTH_FLAG_KEY,
    DASHBOARD_COLUMN_DISPLAY_KEY,
    DASHBOARD_FILTER_KEY,
    DEVICES_HIDE_DISABLED_KEY,
    HOMEPAGE_KEY,
    I18NEXTLNG_KEY,
    MAX_ON_SCREEN_NOTIFICATIONS_KEY,
    NETWORK_MAP_LABEL_TYPE_KEY,
    NETWORK_MAP_LAYOUT_TYPE_KEY,
    NETWORK_MAP_LINK_DISTANCE_KEY,
    NETWORK_MAP_NODE_STRENGTH_KEY,
    NETWORK_MAP_SHOW_ICONS_KEY,
    NETWORK_RAW_DISPLAY_TYPE_KEY,
    PERMIT_JOIN_TIME_KEY,
    TABLE_COLUMN_FILTER_KEY,
    TABLE_COLUMN_VISIBILITY_KEY,
    THEME_KEY,
    TOKEN_KEY,
} from "../localStoreConsts.js";

export default function FrontendSettingsPage() {
    const { t } = useTranslation(["settings", "navbar", "network", "common"]);
    const [homepage, setHomepage] = useState<string>(store2.get(HOMEPAGE_KEY, "devices"));
    const [dashboardColumnDisplay, setDashboardColumnDisplay] = useState<boolean>(store2.get(DASHBOARD_COLUMN_DISPLAY_KEY, false));
    const [permitJoinTime, setPermitJoinTime] = useState<number>(store2.get(PERMIT_JOIN_TIME_KEY, 254));
    const [maxOnScreenNotifications, setMaxOnScreenNotifications] = useState<number>(store2.get(MAX_ON_SCREEN_NOTIFICATIONS_KEY, 3));
    const [networkRawDisplayType, setNetworkRawDisplayType] = useState<NetworkRawDisplayType>(store2.get(NETWORK_RAW_DISPLAY_TYPE_KEY, "data"));
    const [networkMapLayoutType, setNetworkMapLayoutType] = useState<LayoutTypes>(store2.get(NETWORK_MAP_LAYOUT_TYPE_KEY, "forceDirected2d"));
    const [networkMapLabelType, setNetworkMapLabelType] = useState<LabelVisibilityType>(store2.get(NETWORK_MAP_LABEL_TYPE_KEY, "all"));
    const [networkMapNodeStrength, setNetworkMapNodeStrength] = useState<number>(store2.get(NETWORK_MAP_NODE_STRENGTH_KEY, -750));
    const [networkMapLinkDistance, setNetworkMapLinkDistance] = useState<number>(store2.get(NETWORK_MAP_LINK_DISTANCE_KEY, 50));
    const [networkMapShowIcons, setNetworkMapShowIcons] = useState<boolean>(store2.get(NETWORK_MAP_SHOW_ICONS_KEY, false));

    useEffect(() => {
        store2.set(HOMEPAGE_KEY, homepage);
    }, [homepage]);

    useEffect(() => {
        store2.set(DASHBOARD_COLUMN_DISPLAY_KEY, dashboardColumnDisplay);
    }, [dashboardColumnDisplay]);

    useEffect(() => {
        store2.set(PERMIT_JOIN_TIME_KEY, permitJoinTime);
    }, [permitJoinTime]);

    useEffect(() => {
        store2.set(MAX_ON_SCREEN_NOTIFICATIONS_KEY, maxOnScreenNotifications);
    }, [maxOnScreenNotifications]);

    useEffect(() => {
        store2.set(NETWORK_RAW_DISPLAY_TYPE_KEY, networkRawDisplayType);
    }, [networkRawDisplayType]);

    useEffect(() => {
        store2.set(NETWORK_MAP_LAYOUT_TYPE_KEY, networkMapLayoutType);
    }, [networkMapLayoutType]);

    useEffect(() => {
        store2.set(NETWORK_MAP_LABEL_TYPE_KEY, networkMapLabelType);
    }, [networkMapLabelType]);

    useEffect(() => {
        store2.set(NETWORK_MAP_NODE_STRENGTH_KEY, networkMapNodeStrength);
    }, [networkMapNodeStrength]);

    useEffect(() => {
        store2.set(NETWORK_MAP_LINK_DISTANCE_KEY, networkMapLinkDistance);
    }, [networkMapLinkDistance]);

    useEffect(() => {
        store2.set(NETWORK_MAP_SHOW_ICONS_KEY, networkMapShowIcons);
    }, [networkMapShowIcons]);

    const resetSettings = useCallback(() => {
        const keys = store2.keys();

        store2.remove(THEME_KEY);
        store2.remove(HOMEPAGE_KEY);
        store2.remove(DASHBOARD_COLUMN_DISPLAY_KEY);
        store2.remove(PERMIT_JOIN_TIME_KEY);
        store2.remove(MAX_ON_SCREEN_NOTIFICATIONS_KEY);
        store2.remove(NETWORK_RAW_DISPLAY_TYPE_KEY);
        store2.remove(NETWORK_MAP_LAYOUT_TYPE_KEY);
        store2.remove(NETWORK_MAP_LABEL_TYPE_KEY);
        store2.remove(NETWORK_MAP_NODE_STRENGTH_KEY);
        store2.remove(NETWORK_MAP_LINK_DISTANCE_KEY);
        store2.remove(NETWORK_MAP_SHOW_ICONS_KEY);
        store2.remove(I18NEXTLNG_KEY);
        store2.remove(DEVICES_HIDE_DISABLED_KEY);
        store2.remove(DASHBOARD_FILTER_KEY);

        for (const key of keys) {
            if (key.startsWith(TABLE_COLUMN_VISIBILITY_KEY) || key.startsWith(TABLE_COLUMN_FILTER_KEY)) {
                store2.remove(key);
            }
        }

        window.location.reload();
    }, []);

    const resetAuth = useCallback(() => {
        store2.remove(TOKEN_KEY);
        store2.remove(AUTH_FLAG_KEY);

        window.location.reload();
    }, []);

    const resetAll = useCallback(() => {
        store2.clearAll();

        window.location.reload();
    }, []);

    return (
        <>
            <div className="alert alert-info alert-vertical sm:alert-horizontal">
                {t("frontend_notice")}
                <div className="flex flex-row flex-wrap gap-2">
                    <ConfirmButton<void>
                        className="btn btn-sm btn-error"
                        onClick={resetSettings}
                        title={t("reset_settings")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        {t("reset_settings")}
                    </ConfirmButton>
                    <ConfirmButton<void>
                        className="btn btn-sm btn-error"
                        onClick={resetAuth}
                        title={t("reset_auth")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        {t("reset_auth")}
                    </ConfirmButton>
                    <ConfirmButton<void>
                        className="btn btn-sm btn-error"
                        onClick={resetAll}
                        title={t("reset_all")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        {t("reset_all")}
                    </ConfirmButton>
                </div>
            </div>
            <div className="flex flex-row flex-wrap gap-4 mt-3">
                <SelectField
                    name="homepage"
                    label={t("homepage")}
                    onChange={(e) => !e.target.validationMessage && setHomepage(e.target.value)}
                    value={homepage}
                    required
                >
                    <option value="devices">{t("navbar:devices")}</option>
                    <option value="dashboard">{t("navbar:dashboard")}</option>
                </SelectField>
                <CheckboxField
                    name="dashboard_column_display"
                    label={t("dashboard_column_display")}
                    checked={dashboardColumnDisplay}
                    onChange={(e) => setDashboardColumnDisplay(e.target.checked)}
                />
                <NumberField
                    type="number"
                    name="permit_join_time"
                    label={t("permit_join_time")}
                    min={10}
                    max={254}
                    required
                    minimal
                    initialValue={permitJoinTime}
                    onSubmit={(value, valid) => valid && value !== "" && setPermitJoinTime(value)}
                />
                <NumberField
                    type="number"
                    name="max_on_screen_notifications"
                    label={t("max_on_screen_notifications")}
                    min={1}
                    max={5}
                    required
                    minimal
                    initialValue={maxOnScreenNotifications}
                    onSubmit={(value, valid) => valid && value !== "" && setMaxOnScreenNotifications(value)}
                />
            </div>
            <h2 className="text-lg mt-2">{t("network_raw")}</h2>
            <div className="flex flex-row flex-wrap gap-4">
                <SelectField
                    name="network:display_type"
                    label={t("network:display_type")}
                    onChange={(e) => !e.target.validationMessage && setNetworkRawDisplayType(e.target.value as NetworkRawDisplayType)}
                    value={networkRawDisplayType}
                    required
                >
                    <option value="data">{t("network:data")}</option>
                    <option value="map">{t("network:map")}</option>
                </SelectField>
            </div>
            <h2 className="text-lg mt-2">{t("network_map")}</h2>
            <div className="flex flex-row flex-wrap gap-4">
                <SelectField
                    name="network:layout_type"
                    label={t("network:layout_type")}
                    onChange={(e) => !e.target.validationMessage && setNetworkMapLayoutType(e.target.value as LayoutTypes)}
                    value={networkMapLayoutType}
                    required
                >
                    <option value="forceDirected2d">forceDirected2d</option>
                    <option value="forceDirected3d">forceDirected3d</option>
                    <option value="radialOut2d">radialOut2d</option>
                    <option value="radialOut3d">radialOut3d</option>
                    <option value="concentric2d">concentric2d</option>
                </SelectField>
                <SelectField
                    name="network:label_type"
                    label={t("network:label_type")}
                    onChange={(e) => !e.target.validationMessage && setNetworkMapLabelType(e.target.value as LabelVisibilityType)}
                    value={networkMapLabelType}
                    required
                >
                    <option value="all">all</option>
                    <option value="auto">auto</option>
                    <option value="none">none</option>
                    <option value="nodes">nodes</option>
                    <option value="edges">edges</option>
                </SelectField>
                <div className="min-w-xs">
                    <NumberField
                        name="network:node_strength"
                        label={t("network:node_strength")}
                        onSubmit={(value, valid) => valid && value !== "" && setNetworkMapNodeStrength(value)}
                        min={-1000}
                        max={-100}
                        step={10}
                        initialValue={networkMapNodeStrength}
                    />
                </div>
                <div className="min-w-xs">
                    <NumberField
                        name="network:link_distance"
                        label={t("network:link_distance")}
                        onSubmit={(value, valid) => valid && value !== "" && setNetworkMapLinkDistance(value)}
                        min={10}
                        max={200}
                        step={5}
                        initialValue={networkMapLinkDistance}
                    />
                </div>
                <CheckboxField
                    name="network:show_icons"
                    label={t("network:show_icons")}
                    onChange={(event) => setNetworkMapShowIcons(event.target.checked)}
                    defaultChecked={networkMapShowIcons}
                />
            </div>
        </>
    );
}
