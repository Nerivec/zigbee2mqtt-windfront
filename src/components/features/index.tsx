import {
    faA,
    faArrowsLeftRightToLine,
    faArrowsRotate,
    faBatteryEmpty,
    faBatteryFull,
    faBatteryHalf,
    faBatteryQuarter,
    faBatteryThreeQuarters,
    faBell,
    faBolt,
    faBrain,
    faCalendarDay,
    faCalendarWeek,
    faCheck,
    faCircle,
    faCircleCheck,
    faCircleExclamation,
    faCircleInfo,
    faClock,
    faCloud,
    faCloudDownloadAlt,
    faCloudRain,
    faCloudShowersHeavy,
    faCloudSunRain,
    faCog,
    faCompass,
    faCube,
    faDatabase,
    faDoorClosed,
    faDoorOpen,
    faDroplet,
    faDumbbell,
    faExclamationCircle,
    faFan,
    faFaucet,
    faFaucetDrip,
    faFeather,
    faFileContract,
    faFilm,
    faFilter,
    faFlask,
    faGaugeHigh,
    faGear,
    faGraduationCap,
    faHashtag,
    faHeartPulse,
    faIcons,
    faIdBadge,
    faIndustry,
    faInfinity,
    faKey,
    faLanguage,
    faLayerGroup,
    faLightbulb,
    faLocationArrow,
    faLock,
    faLungs,
    faMap,
    faMobileVibrate,
    faNetworkWired,
    faPalette,
    faPause,
    faPercent,
    faPerson,
    faPersonWalking,
    faPlane,
    faPlay,
    faPlugCircleXmark,
    faPowerOff,
    faRadiation,
    faRadiationAlt,
    faRainbow,
    faRotate,
    faRuler,
    faSeedling,
    faShieldHalved,
    faSignal,
    faSliders,
    faSlidersH,
    faSmoking,
    faSnowflake,
    faStarHalfAlt,
    faStop,
    faSun,
    faTag,
    faTemperatureHigh,
    faTemperatureLow,
    faTextHeight,
    faThermometerEmpty,
    faThermometerFull,
    faThermometerHalf,
    faThermometerQuarter,
    faThermometerThreeQuarters,
    faToggleOn,
    faTowerBroadcast,
    faTriangleExclamation,
    faTurnUp,
    faUserLock,
    faUserShield,
    faVolumeHigh,
    faVolumeUp,
    faWandMagicSparkles,
    faWarehouse,
    faWater,
    faWaveSquare,
    faWifi,
    faWindowMaximize,
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

export type TemperatureUnit = "°C" | "°F";

const ICON_MAP: Record<string, IconDefinition> = {
    action: faA,

    // Power / electrical
    // battery: faBatteryFull, // customized in fn
    battery_low: faBatteryEmpty,
    rms_voltage: faBolt,
    over_voltage: faBolt,
    under_voltage: faBolt,
    voltage: faBolt,
    overpower: faBolt,
    overcurrent: faBolt,
    current: faBolt,
    reactive_energy: faBolt,
    signed_power: faBolt,
    power: faBolt,
    energy: faBolt,
    watt: faBolt,
    frequency: faWaveSquare,
    power_factor: faIndustry,

    // Temperature / climate
    // cpu_temperature: faTemperatureHigh, // customized in fn
    heating_stop: faTemperatureHigh,
    heat_protect: faTemperatureHigh,
    warm_floor: faTemperatureHigh,
    // temperature: faTemperatureHigh, // customized in fn
    cold_water: faSnowflake,
    frost: faSnowflake,
    cool: faTemperatureLow,
    hot_water: faTemperatureHigh,
    pressure: faCloudDownloadAlt,

    // Environment (humidity / air / gas)
    humidity: faDroplet,
    moisture: faDroplet,
    soil_moisture: faSeedling,
    co2: faCloud,
    eco2: faCloud,
    pm25: faCloud,
    pm10: faCloud,
    voc: faCloud,
    aqi: faCloud,
    air_quality: faCloud,
    hcho: faFlask,
    formaldehyd: faFlask,
    gas: faCloud,
    smoke: faSmoking,
    carbon_monoxide: faCloud,

    // Water / leak / irrigation
    active_water_leak: faWater,
    water_leak: faWater,
    leakage: faWater,
    leak: faWater,
    rainwater: faCloudShowersHeavy,
    rain: faCloudRain,
    irrigation: faSeedling,
    watering: faSeedling,
    tank_level: faWater,
    tds: faWater,
    salinity: faWater,
    ph: faWater,
    orp: faWater,
    free_chlorine: faWater,
    flow: faFaucetDrip,

    // Motion / presence / people
    away_mode: faPlane,
    mmwave: faPersonWalking,
    motionless: faPerson,
    motion: faPersonWalking,
    movement: faPersonWalking,
    moving: faPersonWalking,
    radar: faPersonWalking,
    vibration: faMobileVibrate,
    presence: faPerson,
    occupancy: faPerson,
    occupied: faPerson,
    vacancy: faPerson,
    vacant: faPerson,
    human: faPerson,
    people: faPerson,

    // Locks / security / access
    keypad: faLock,
    child_lock: faLock,
    button_lock: faLock,
    lock_mode: faLock,
    hooks_lock: faLock,
    lock: faLock,
    pin_code: faKey,
    master_pin: faKey,
    rfid: faIdBadge,
    permission: faUserLock,
    admin: faUserShield,
    master: faUserShield,

    // Doors / windows / contact
    garage_door: faWarehouse,
    door_state: faDoorClosed,
    door: faDoorClosed,
    window_open: faWindowMaximize,
    window: faWindowMaximize,
    // contact: faDoorClosed, // customized in fn
    fixed_window_sash: faWindowMaximize,

    // Switches / relay / valve
    relay: faToggleOn,
    switch: faToggleOn,
    toggle: faToggleOn,
    electric_valve: faFaucet,
    valve: faFaucet,
    flow_switch: faFaucet,
    pump: faFaucet,

    // Lighting / brightness
    led_disabled: faLightbulb,
    led: faLightbulb,
    backlight: faLightbulb,
    brightness: faSun,
    luminance: faSun,
    illuminance: faSun,
    illuminance_lux: faSun,
    lux_value: faSun,
    white_brightness: faSun,
    light_mode: faLightbulb,
    light: faLightbulb,
    rgb_light: faPalette,
    color: faPalette,
    color_hs: faPalette,
    color_temp: faSlidersH,
    color_temp_startup: faSlidersH,
    color_xy: faPalette,
    gradient: faRainbow,

    // Position / orientation / distance
    orientation: faCompass,
    target_distance: faRuler,
    distance: faRuler,
    position: faPercent,
    tilt: faLocationArrow,
    direction: faLocationArrow,
    axis: faRuler,
    location_x: faRuler,
    range: faRuler,
    angle_x: faX,
    angle_y: faY,
    angle_z: faZ,
    approach_distance: faArrowsLeftRightToLine,
    side: faCube,

    // Time / scheduling
    timestamp: faClock,
    countdown: faClock,
    timer: faClock,
    schedule: faCalendarWeek,
    weekdays: faCalendarWeek,
    monday: faCalendarWeek,
    tuesday: faCalendarWeek,
    wednesday: faCalendarWeek,
    thursday: faCalendarWeek,
    friday: faCalendarWeek,
    saturday: faCalendarWeek,
    sunday: faCalendarWeek,
    week: faCalendarWeek,
    dayTime: faClock,
    hour: faClock,
    minute: faClock,
    time_format: faClock,
    time: faClock,
    uptime: faClock,
    interval: faClock,
    duration: faClock,
    delay: faClock,
    holidays_schedule: faCalendarDay,
    workdays_schedule: faCalendarDay,

    // Scenes / effects
    gradient_scene: faFilm,
    scene: faFilm,
    individual_led_effect: faWandMagicSparkles,
    effect: faWandMagicSparkles,

    // Audio / sound
    ringtone: faVolumeHigh,
    melody: faVolumeHigh,
    sound_volume: faVolumeHigh,
    volume: faVolumeHigh,
    buzzer: faVolumeHigh,
    beep: faVolumeHigh,
    handlesound: faVolumeHigh,
    keysound: faVolumeHigh,
    play_voice: faVolumeHigh,
    pulse_command: faVolumeHigh,
    squawk: faVolumeHigh,
    siren_and_light: faBell,
    sound: faVolumeUp,

    // Alerts / faults / security
    humidity_alarm: faTriangleExclamation,
    sos: faTriangleExclamation,
    broadcast_alarm: faTriangleExclamation,
    linkage_alarm: faTriangleExclamation,
    alarm: faTriangleExclamation,
    alert_behaviour: faTriangleExclamation,
    warning: faTriangleExclamation,
    clear_fault: faCircleCheck,
    fault: faCircleExclamation,
    error: faCircleExclamation,
    breaker: faCircleExclamation,
    trouble: faCircleExclamation,
    supervision: faShieldHalved,
    protection: faShieldHalved,
    power_outage_count: faPlugCircleXmark,
    tamper: faExclamationCircle,
    temperature_alarm: faTriangleExclamation,

    // Status / state / power
    factory_reset: faPowerOff,
    restore_default: faPowerOff,
    reset_switch: faPowerOff,
    powerup_status: faPowerOff,
    status: faCircleInfo,
    state: faStarHalfAlt,
    enabled: faCircleCheck,
    online: faWifi,
    lifecycle: faInfinity,
    test: faCheck,
    trigger_count: faTurnUp,

    // Connectivity / network
    wifi: faWifi,
    rssi: faWifi,
    transmit_power: faTowerBroadcast,
    radio_strength: faTowerBroadcast,
    rf_pairing: faTowerBroadcast,
    ip_address: faNetworkWired,
    linkquality: faSignal,

    // Data / update / configuration
    update_frequency: faRotate,
    refresh_rate: faRotate,
    forceupdate: faRotate,
    update: faRotate,
    data_report: faDatabase,
    data: faDatabase,
    payload: faDatabase,
    config: faSliders,
    settings_reset: faSliders,
    settings: faSliders,
    setup: faSliders,
    adaptation_run_settings: faSliders,
    adaptation: faSliders,
    regulator_mode: faSliders,
    operating_mode: faSliders,
    operation_mode: faSliders,
    manual_mode: faSliders,
    automatic_mode: faSliders,
    mode: faSliders,
    options: faSliders,
    advanced: faSliders,
    algorithm: faBrain,
    control_algorithm: faBrain,
    calibration: faRuler,
    calibrate: faRuler,
    limits_calibration: faRuler,
    set_upper_limit: faRuler,
    limit: faRuler,
    level_config: faGear,
    sensitivity: faFeather,
    system_mode: faCog,

    // Health
    heartbeat: faHeartPulse,
    breathing_rate: faLungs,
    pulse: faHeartPulse,

    // Strength / force
    strength: faDumbbell,
    force: faDumbbell,

    // Percent
    percent_state: faPercent,
    percent: faPercent,
    percentage: faPercent,

    // Playback control
    play: faPlay,
    pause: faPause,
    stop: faStop,

    // Restart / relaunch
    restart: faArrowsRotate,
    relaunch: faArrowsRotate,

    // Identifiers
    serial_number: faHashtag,
    meter_id: faHashtag,
    sceneid: faHashtag,
    id: faHashtag,

    // Grouping / layout
    group: faLayerGroup,
    zone: faLayerGroup,
    zones: faLayerGroup,
    region: faMap,
    sub_region: faMap,

    // Contracts / production
    contract: faFileContract,
    contract_type: faFileContract,
    production: faIndustry,
    producer: faIndustry,

    // Generic descriptors
    model: faTag,
    name: faTag,
    type: faTag,
    station: faWarehouse,

    // Icons / UI
    icon_application: faIcons,
    font_size: faTextHeight,
    theme: faPalette,
    language: faLanguage,
    translation: faLanguage,

    // Learning
    learn_ir_code: faGraduationCap,
    spatial_learning: faGraduationCap,
    learning: faGraduationCap,

    // Speed / performance
    fan_speed: faFan,
    speed: faGaugeHigh,
    supported_max_motor_speed: faGaugeHigh,

    // Growth / feeding
    fertility: faSeedling,
    feed: faSeedling,

    // Filters
    replace_filter: faFilter,
    filter_age: faFilter,
    filter: faFilter,

    // Radiation
    radiation_dose_per_hour: faRadiation,
    radioactive_events_per_minute: faRadiationAlt,
    radioactive_events: faRadiationAlt,
    radiation: faRadiation,

    // Weather general
    weather: faCloudSunRain,
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
        case "cpu_temperature":
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
            }

            break;
        }
        case "presence": {
            if (value) {
                classes.push("text-warning");
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

    icon = ICON_MAP[name];

    return icon ? [icon, classes.join(" "), spec] : [faCircle, "opacity-0", {}];
};

export const getFeatureKey = (feature: FeatureWithAnySubFeatures) =>
    `${feature.type}-${feature.name}-${feature.label}-${feature.property}-${feature.access}-${feature.category}-${feature.endpoint}`;
