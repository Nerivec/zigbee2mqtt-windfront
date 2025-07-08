import {
    faA,
    faArrowsLeftRightToLine,
    faAtom,
    faBatteryEmpty,
    faBatteryFull,
    faBatteryHalf,
    faBatteryQuarter,
    faBatteryThreeQuarters,
    faBolt,
    faCalendarDay,
    faCalendarWeek,
    faCheck,
    faCircle,
    faCloudDownloadAlt,
    faCog,
    faCopyright,
    faCube,
    faDoorClosed,
    faDoorOpen,
    faExclamationCircle,
    faExclamationTriangle,
    faFaucetDrip,
    faFeather,
    faFillDrip,
    faGear,
    faIndustry,
    faInfinity,
    faPalette,
    faPercent,
    faPersonRays,
    faPlane,
    faPlug,
    faPlugCircleXmark,
    faPowerOff,
    faRadiation,
    faRadiationAlt,
    faRainbow,
    faSignal,
    faSlidersH,
    faSmoking,
    faStarHalfAlt,
    faSun,
    faThermometerEmpty,
    faThermometerFull,
    faThermometerHalf,
    faThermometerQuarter,
    faThermometerThreeQuarters,
    faTint,
    faTriangleExclamation,
    faTurnUp,
    faUserCog,
    faVolumeUp,
    faWalking,
    faWandMagicSparkles,
    faWarehouse,
    faWater,
    faWaveSquare,
    faX,
    faY,
    faZ,
    type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import type { FunctionComponent, HTMLAttributes, PropsWithChildren } from "react";
import type { Zigbee2MQTTDeviceOptions } from "zigbee2mqtt";
import type { Device, DeviceState, FeatureWithAnySubFeatures } from "../../types.js";
import type { FeatureWrapperProps } from "./FeatureWrapper.js";

export interface BaseFeatureProps<T extends FeatureWithAnySubFeatures> extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    feature: T;
    deviceValue: unknown;
    device: Device;
    onChange(value: Record<string, unknown> | unknown): void;
    onRead?(value: Record<string, unknown> | unknown): void;
    featureWrapperClass: FunctionComponent<PropsWithChildren<FeatureWrapperProps>>;
    minimal?: boolean;
}

export interface BaseWithSubFeaturesProps<T extends FeatureWithAnySubFeatures> extends Omit<BaseFeatureProps<T>, "deviceValue"> {
    deviceState: DeviceState | Zigbee2MQTTDeviceOptions;
}

export type FaIconFlip = "horizontal" | "vertical" | "both";
export type TemperatureUnit = "°C" | "°F";

export const TYPE_TO_CLASS_MAP: Record<string, IconDefinition> = {
    battery_low: faBatteryEmpty,
    humidity: faTint,
    illuminance: faSun,
    pressure: faCloudDownloadAlt,
    co2: faAtom,
    voltage: faBolt,
    state: faStarHalfAlt,
    brightness: faSun,
    occupancy: faWalking,
    presence: faPersonRays,
    current: faCopyright,
    power: faPowerOff,
    energy: faPlug,
    frequency: faWaveSquare,
    tamper: faExclamationCircle,
    smoke: faSmoking,
    radiation_dose_per_hour: faRadiation,
    radioactive_events_per_minute: faRadiationAlt,
    power_factor: faIndustry,
    mode: faUserCog,
    sound: faVolumeUp,
    position: faPercent,
    alarm: faExclamationTriangle,
    color_xy: faPalette,
    color_hs: faPalette,
    color_temp: faSlidersH,
    color_temp_startup: faSlidersH,
    illuminance_lux: faSun,
    soil_moisture: faFillDrip,
    water_leak: faWater,
    week: faCalendarWeek,
    workdays_schedule: faCalendarDay,
    holidays_schedule: faCalendarDay,
    away_mode: faPlane,
    vibration: faWater,
    power_outage_count: faPlugCircleXmark,
    action: faA,
    angle_x: faX,
    angle_y: faY,
    angle_z: faZ,
    side: faCube,
    humidity_alarm: faTriangleExclamation,
    temperature_alarm: faTriangleExclamation,
    approach_distance: faArrowsLeftRightToLine,
    distance: faArrowsLeftRightToLine,
    trigger_count: faTurnUp,
    level_config: faGear,
    station: faWarehouse,
    effect: faWandMagicSparkles,
    linkquality: faSignal,
    system_mode: faCog,
    gradient: faRainbow,
    sensitivity: faFeather,
    test: faCheck,
    flow: faFaucetDrip,
};

const getBatteryIcon = (level: number | undefined, outClasses: string[]) => {
    let icon = faBatteryEmpty;

    if (level == null) {
        return icon;
    }

    if (level >= 85) {
        icon = faBatteryFull;

        outClasses.push("text-success");
    } else if (level >= 65) {
        icon = faBatteryThreeQuarters;
    } else if (level >= 40) {
        icon = faBatteryHalf;
    } else if (level >= 20) {
        icon = faBatteryQuarter;
    } else {
        icon = faBatteryEmpty;

        outClasses.push("text-error");
    }

    return icon;
};

const getBatteryStateIcon = (state: string | undefined, outClasses: string[]) => {
    let icon = faBatteryEmpty;

    switch (state) {
        case "high": {
            icon = faBatteryFull;

            outClasses.push("text-success");
            break;
        }
        case "medium": {
            icon = faBatteryHalf;
            break;
        }
        case "low": {
            icon = faBatteryEmpty;

            outClasses.push("text-error");
            break;
        }
    }

    return icon;
};

const getTemperatureIcon = (temperature: number | undefined, unit: TemperatureUnit | undefined, outClasses: string[]) => {
    let icon = faThermometerEmpty;

    if (temperature == null) {
        return icon;
    }

    if (unit === "°F") {
        temperature = (temperature - 32) / 1.8;
    }

    if (temperature >= 30) {
        icon = faThermometerFull;

        outClasses.push("text-error");
    } else if (temperature >= 25) {
        icon = faThermometerThreeQuarters;
    } else if (temperature >= 20) {
        icon = faThermometerHalf;
    } else if (temperature >= 15) {
        icon = faThermometerQuarter;
    } else if (temperature < 5) {
        icon = faThermometerEmpty;

        outClasses.push("text-info");
    }

    return icon;
};

export const getFeatureIcon = (name: string, value: unknown, unit?: unknown): [IconDefinition, string, Record<string, unknown>] => {
    let icon: IconDefinition | undefined;
    const classes: string[] = [];
    const spec: Record<string, unknown> = {};

    switch (name) {
        case "battery": {
            icon = getBatteryIcon(value as number, classes);
            break;
        }
        case "battery_state": {
            icon = getBatteryStateIcon(value as string, classes);
            break;
        }
        case "battery_low": {
            if (value) {
                classes.push("text-error");
            }

            break;
        }
        case "device_temperature":
        case "temperature":
        case "local_temperature": {
            icon = getTemperatureIcon(value as number, unit as TemperatureUnit, classes);
            break;
        }
        case "humidity": {
            if (value != null && (value as number) > 60) {
                classes.push("text-info");
            }

            break;
        }
        case "contact": {
            icon = value ? faDoorClosed : faDoorOpen;

            if (!value) {
                classes.push("text-primary");
            }

            break;
        }
        case "occupancy": {
            if (value) {
                classes.push("text-warning");
                spec.beat = true;
            }

            break;
        }
        case "presence": {
            if (value) {
                classes.push("text-warning");
                spec.beat = true;
            }

            break;
        }
        case "tamper": {
            if (value) {
                classes.push("text-error");
                spec.beatFade = true;
                spec.shake = true;
            }

            break;
        }
        case "water_leak": {
            if (value) {
                classes.push("text-primary");
                spec.beatFade = true;
            }

            break;
        }
        case "vibration": {
            if (value) {
                classes.push("text-primary");
                spec.shake = true;
            }

            break;
        }
        default: {
            if (name.includes("cyclic")) {
                icon = faInfinity;
            }

            break;
        }
    }

    if (icon) {
        return [icon, classes.join(" "), spec];
    }

    icon = TYPE_TO_CLASS_MAP[name];

    return icon ? [icon, classes.join(" "), spec] : [faCircle, "opacity-0", {}];
};

export const getFeatureKey = (feature: FeatureWithAnySubFeatures) =>
    `${feature.type}-${feature.name}-${feature.label}-${feature.property}-${feature.access}-${feature.category}-${feature.endpoint}`;
