import { type JSX, memo } from "react";
import { useTranslation } from "react-i18next";
import { DEVICE_AVAILABILITY_DOCS_URL } from "../../consts.js";
import type { AvailabilityState } from "../../types.js";

export type AvailabilityStateProps = {
    availability: AvailabilityState["state"];
    availabilityFeatureEnabled: boolean;
    availabilityEnabledForDevice: boolean | undefined;
    disabled: boolean;
};

const Availability = memo((props: AvailabilityStateProps): JSX.Element => {
    const { t } = useTranslation("availability");
    const { availability, availabilityFeatureEnabled, availabilityEnabledForDevice, disabled } = props;

    if (disabled) {
        return <span>{t(($) => $.disabled)}</span>;
    }

    return (availabilityEnabledForDevice ?? availabilityFeatureEnabled) ? (
        <span className={availability === "online" ? "text-success" : "text-error"}>{t(($) => $[availability])}</span>
    ) : (
        <a className="link link-hover" target="_blank" rel="noopener noreferrer" href={DEVICE_AVAILABILITY_DOCS_URL}>
            {t(($) => $.disabled)}
        </a>
    );
});

export default Availability;
