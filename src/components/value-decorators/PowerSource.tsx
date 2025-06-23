import {
    faBatteryEmpty,
    faBatteryFull,
    faBatteryHalf,
    faBatteryQuarter,
    faBatteryThreeQuarters,
    faLeaf,
    faPlug,
    faPlugCircleExclamation,
    faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import snakeCase from "lodash/snakeCase.js";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Device, PowerSource as TPowerSource } from "../../types.js";

interface PowerSourceProps {
    device?: Device;
    batteryPercent?: number | null;
    batteryState?: string | null;
    batteryLow?: boolean | null;
    showLevel?: boolean;
}

const PowerSource = memo((props: PowerSourceProps) => {
    const { device, batteryPercent, batteryState, batteryLow, showLevel, ...rest } = props;
    const { t } = useTranslation("zigbee");
    let source: TPowerSource | undefined;

    if (device?.power_source) {
        source = device.power_source as TPowerSource;
    }

    switch (source) {
        case "Battery": {
            let title = t("battery");
            let batteryFormatted = "";
            let batteryIcon = faBatteryFull;
            let fade = false;

            // Some devices do not use the standardized feature `battery` to report power level.
            if (batteryPercent != null) {
                batteryFormatted = `${batteryPercent}%`;

                if (batteryPercent >= 85) {
                    batteryIcon = faBatteryFull;
                } else if (batteryPercent >= 65) {
                    batteryIcon = faBatteryThreeQuarters;
                } else if (batteryPercent >= 40) {
                    batteryIcon = faBatteryHalf;
                } else if (batteryPercent >= 20) {
                    batteryIcon = faBatteryQuarter;
                } else {
                    batteryIcon = faBatteryEmpty;
                    fade = true;
                }
            } else if (batteryState != null) {
                batteryFormatted = batteryState;

                switch (batteryState) {
                    case "high":
                        batteryIcon = faBatteryFull;
                        break;
                    case "medium":
                        batteryIcon = faBatteryHalf;
                        break;
                    case "low":
                        batteryIcon = faBatteryEmpty;
                        fade = true;
                        break;
                }
            } else if (batteryLow != null) {
                batteryFormatted = batteryLow ? "low" : "ok";
                batteryIcon = batteryLow ? faBatteryEmpty : faBatteryFull;
            }

            // If battery warning triggered: add blink independent of power_level source.
            if (batteryLow === true) {
                fade = true;
            }

            if (batteryFormatted !== "") {
                title += `, ${t("power_level")}: ${batteryFormatted}`;
            }

            return (
                <span className={fade ? "text-error" : ""}>
                    <FontAwesomeIcon icon={batteryIcon} fade={fade} title={title} {...rest} />
                    {showLevel && <span className="ps-2">{batteryFormatted}</span>}
                </span>
            );
        }
        case "Mains (single phase)":
        case "Mains (3 phase)":
        case "DC Source": {
            return <FontAwesomeIcon icon={faPlug} title={t(snakeCase(source))} {...rest} />;
        }
        case "Emergency mains and transfer switch":
        case "Emergency mains constantly powered": {
            return <FontAwesomeIcon icon={faPlugCircleExclamation} title={t(snakeCase(source))} {...rest} />;
        }
        default: {
            if (device?.type === "GreenPower") {
                return <FontAwesomeIcon icon={faLeaf} title={"Green"} {...rest} />;
            }

            return <FontAwesomeIcon icon={faQuestion} title={source ? t(snakeCase(source)) : undefined} {...rest} />;
        }
    }
});

export default PowerSource;
