import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { HOMEPAGE_KEY, I18NEXTLNG_KEY, MAX_ON_SCREEN_NOTIFICATIONS_KEY, PERMIT_JOIN_TIME_KEY, THEME_KEY } from "../../../localStoreConsts.js";
import Button from "../../Button.js";
import InputField from "../../form-fields/InputField.js";
import SelectField from "../../form-fields/SelectField.js";

// XXX: workaround typing
const local = store2 as unknown as typeof store2.default;

export default function Frontend() {
    const { t } = useTranslation(["settings", "navbar"]);
    const [homepage, setHomepage] = useState<string>(local.get(HOMEPAGE_KEY, "devices"));
    const [permitJoinTime, setPermitJoinTime] = useState<number>(local.get(PERMIT_JOIN_TIME_KEY, 254));
    const [maxOnScreenNotifications, setMaxOnScreenNotifications] = useState<number>(local.get(MAX_ON_SCREEN_NOTIFICATIONS_KEY, 4));

    useEffect(() => {
        local.set(HOMEPAGE_KEY, homepage);
    }, [homepage]);

    useEffect(() => {
        local.set(PERMIT_JOIN_TIME_KEY, permitJoinTime);
    }, [permitJoinTime]);

    useEffect(() => {
        local.set(MAX_ON_SCREEN_NOTIFICATIONS_KEY, maxOnScreenNotifications);
    }, [maxOnScreenNotifications]);

    const resetAll = () => {
        local.remove(THEME_KEY);
        local.remove(HOMEPAGE_KEY);
        local.remove(PERMIT_JOIN_TIME_KEY);
        local.remove(MAX_ON_SCREEN_NOTIFICATIONS_KEY);
        local.remove(I18NEXTLNG_KEY);

        window.location.reload();
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="alert alert-info alert-vertical sm:alert-horizontal mb-3">
                {t("frontend_notice")}
                <div>
                    <Button<void> className="btn btn-sm btn-error" onClick={resetAll}>
                        {t("reset_all")}
                    </Button>
                </div>
            </div>
            <div>
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
            </div>
            <div>
                <InputField
                    type="number"
                    name="permit_join_time"
                    label={t("permit_join_time")}
                    min={10}
                    max={254}
                    required
                    value={permitJoinTime}
                    onChange={(e) => !e.target.validationMessage && !!e.target.value && setPermitJoinTime(e.target.valueAsNumber)}
                />
            </div>
            <div>
                <InputField
                    type="number"
                    name="max_on_screen_notifications"
                    label={t("max_on_screen_notifications")}
                    min={1}
                    max={5}
                    required
                    value={maxOnScreenNotifications}
                    onChange={(e) => !e.target.validationMessage && !!e.target.value && setMaxOnScreenNotifications(e.target.valueAsNumber)}
                />
            </div>
        </div>
    );
}
