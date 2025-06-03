import { type JSX, memo } from "react";
import { useTranslation } from "react-i18next";
import type { AvailabilityState } from "../../types.js";

export type AvailabilityStateProps = {
    availability: AvailabilityState;
    availabilityFeatureEnabled: boolean;
    availabilityEnabledForDevice: boolean | undefined;
    disabled: boolean;
};

const Availability = memo((props: AvailabilityStateProps): JSX.Element => {
    const { t } = useTranslation(["availability"]);
    const { availability, availabilityFeatureEnabled, availabilityEnabledForDevice, disabled } = props;

    if (disabled) {
        return <span>{t("disabled")}</span>;
    }

    return (availabilityEnabledForDevice ?? availabilityFeatureEnabled) ? (
        <span className={availability.state === "online" ? "text-success" : "text-error animate-pulse"}>{t(availability.state)}</span>
    ) : (
        <a
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.zigbee2mqtt.io/guide/configuration/device-availability.html#availability-advanced-configuration"
        >
            {t("disabled")}
        </a>
    );
});

export default Availability;
