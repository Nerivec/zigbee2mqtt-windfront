import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import ConfirmButton from "../components/ConfirmButton.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import NumberField from "../components/form-fields/NumberField.js";
import SelectField from "../components/form-fields/SelectField.js";
import {
    AUTH_FLAG_KEY,
    HIDE_STATIC_INFO_ALERTS,
    HOMEPAGE_KEY,
    I18NEXTLNG_KEY,
    MAX_ON_SCREEN_NOTIFICATIONS_KEY,
    MULTI_INSTANCE_SHOW_SOURCE_NAME_KEY,
    NETWORK_MAP_CONFIG_KEY,
    NETWORK_RAW_DISPLAY_TYPE_KEY,
    PERMIT_JOIN_TIME_KEY,
    TABLE_COLUMNS_KEY,
    TABLE_FILTERS_KEY,
    THEME_KEY,
    TOKEN_KEY,
} from "../localStoreConsts.js";
import { MULTI_INSTANCE } from "../store.js";

export default function FrontendSettingsPage() {
    const { t } = useTranslation(["settings", "navbar", "network", "common"]);
    const [homepage, setHomepage] = useState<string>(store2.get(HOMEPAGE_KEY, "devices"));
    const [permitJoinTime, setPermitJoinTime] = useState<number>(store2.get(PERMIT_JOIN_TIME_KEY, 254));
    const [maxOnScreenNotifications, setMaxOnScreenNotifications] = useState<number>(store2.get(MAX_ON_SCREEN_NOTIFICATIONS_KEY, 3));
    const [hideStaticInfoAlerts, setHideStaticInfoAlerts] = useState<boolean>(store2.get(HIDE_STATIC_INFO_ALERTS, false));
    const [miShowSourceName, setMiShowSourceName] = useState<boolean>(store2.get(MULTI_INSTANCE_SHOW_SOURCE_NAME_KEY, true));

    useEffect(() => {
        store2.set(HOMEPAGE_KEY, homepage);
    }, [homepage]);

    useEffect(() => {
        store2.set(PERMIT_JOIN_TIME_KEY, permitJoinTime);
    }, [permitJoinTime]);

    useEffect(() => {
        store2.set(MAX_ON_SCREEN_NOTIFICATIONS_KEY, maxOnScreenNotifications);
    }, [maxOnScreenNotifications]);

    useEffect(() => {
        store2.set(HIDE_STATIC_INFO_ALERTS, hideStaticInfoAlerts);
    }, [hideStaticInfoAlerts]);

    useEffect(() => {
        store2.set(MULTI_INSTANCE_SHOW_SOURCE_NAME_KEY, miShowSourceName);
    }, [miShowSourceName]);

    const resetSettings = useCallback(() => {
        const keys = store2.keys();

        store2.remove(THEME_KEY);
        store2.remove(HOMEPAGE_KEY);
        store2.remove(PERMIT_JOIN_TIME_KEY);
        store2.remove(MAX_ON_SCREEN_NOTIFICATIONS_KEY);
        store2.remove(HIDE_STATIC_INFO_ALERTS);
        store2.remove(NETWORK_RAW_DISPLAY_TYPE_KEY);
        store2.remove(NETWORK_MAP_CONFIG_KEY);
        store2.remove(MULTI_INSTANCE_SHOW_SOURCE_NAME_KEY);
        store2.remove(I18NEXTLNG_KEY);

        for (const key of keys) {
            if (key.startsWith(TABLE_COLUMNS_KEY) || key.startsWith(TABLE_FILTERS_KEY)) {
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
                <CheckboxField
                    name="common:hide_static_info_alerts"
                    label={t("common:hide_static_info_alerts")}
                    onChange={(event) => setHideStaticInfoAlerts(event.target.checked)}
                    defaultChecked={hideStaticInfoAlerts}
                />
            </div>
            {MULTI_INSTANCE && (
                <>
                    <h2 className="text-lg mt-2">{t("common:multi_instance")}</h2>
                    <div className="flex flex-row flex-wrap gap-4">
                        <CheckboxField
                            name="common:show_source_name"
                            label={t("common:show_source_name")}
                            onChange={(event) => setMiShowSourceName(event.target.checked)}
                            defaultChecked={miShowSourceName}
                        />
                    </div>
                </>
            )}
        </>
    );
}
