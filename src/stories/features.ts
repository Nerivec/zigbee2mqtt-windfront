import {
    type BinaryFeature,
    type ClimateFeature,
    type CompositeFeature,
    type CoverFeature,
    type DeviceState,
    type EnumFeature,
    type FanFeature,
    FeatureAccessMode,
    type LightFeature,
    type ListFeature,
    type LockFeature,
    type NumericFeature,
    type SwitchFeature,
    type TextFeature,
} from "../types";

export const binaryFeature: BinaryFeature = {
    name: "state",
    label: "My Binary Feature",
    access: FeatureAccessMode.ALL,
    description: "State like on/off",
    // category?: "config" | "diagnostic";
    type: "binary",
    property: "state",
    value_on: true,
    value_off: false,
    // value_toggle?: string;
    // endpoint?: string;
};

export const numericFeature: NumericFeature = {
    name: "brightness",
    label: "My Numeric Feature",
    access: FeatureAccessMode.ALL,
    description: "State like brightness or water flow",
    // category?: "config" | "diagnostic";
    type: "numeric",
    property: "brightness",
    // unit?: string;
    // value_max?: number;
    // value_min?: number;
    // value_step?: number;
    // presets?: {
    //     name: string;
    //     value: number | string;
    //     description: string;
    // }[];
};

export const textFeature: TextFeature = {
    name: "my_text_feature",
    label: "My Text Feature",
    access: FeatureAccessMode.ALL,
    description: "Any string state",
    // category?: "config" | "diagnostic";
    type: "text",
    property: "my_text_feature",
};

export const enumFeature: EnumFeature = {
    name: "my_enum_feature",
    label: "My Enum Feature",
    access: FeatureAccessMode.ALL,
    description: "Any numeric or text with pre-defined values",
    // category?: "config" | "diagnostic";
    type: "enum",
    property: "my_enum_feature",
    values: ["one", "two"],
};

export const listFeature: ListFeature = {
    name: "my_list_prop",
    label: "My List Feature",
    access: FeatureAccessMode.ALL,
    description: "List of Numeric, Binary, Composite, Text or Enum",
    // category?: "config" | "diagnostic";
    type: "list",
    property: "my_list_prop",
    // @ts-expect-error bad ZHC typing: can't have `property` if wanting [1, 2] instead of [{x: 1}, {x: 2}]
    item_type: {
        name: "x",
        label: "X",
        access: FeatureAccessMode.ALL,
        type: "numeric",
    },
    // length_min?: number;
    // length_max?: number;
};

export const compositeFeature: CompositeFeature = {
    name: "my_composite_feature",
    label: "My Composite Feature",
    access: FeatureAccessMode.ALL,
    // category?: "config" | "diagnostic";
    type: "composite",
    property: "my_composite_feature",
    features: [{ ...numericFeature }, { ...textFeature }],
};

export const lightFeature: LightFeature = {
    name: "my_light_feature",
    label: "My Light Feature",
    access: FeatureAccessMode.ALL,
    // category?: "config" | "diagnostic";
    type: "light",
    property: "my_light_feature",
    features: [
        { ...binaryFeature, value_on: "ON", value_off: "OFF" },
        { ...numericFeature, value_min: 0, value_max: 254, value_step: 1 },
        {
            ...numericFeature,
            name: "color_temp",
            property: "color_temp",
            presets: [
                {
                    description: "Coolest temperature supported",
                    name: "coolest",
                    value: 153,
                },
                {
                    description: "Cool temperature (250 mireds / 4000 Kelvin)",
                    name: "cool",
                    value: 250,
                },
                {
                    description: "Neutral temperature (370 mireds / 2700 Kelvin)",
                    name: "neutral",
                    value: 370,
                },
                {
                    description: "Warm temperature (454 mireds / 2200 Kelvin)",
                    name: "warm",
                    value: 454,
                },
                {
                    description: "Warmest temperature supported",
                    name: "warmest",
                    value: 500,
                },
            ],
        },
        {
            name: "color_xy",
            label: "My Color XY Feature",
            access: FeatureAccessMode.ALL,
            // category?: "config" | "diagnostic";
            type: "composite",
            property: "color",
            features: [
                { ...numericFeature, name: "x", property: "x" },
                { ...numericFeature, name: "y", property: "y" },
            ],
        },
        {
            name: "color_hs",
            label: "My Color HS Feature",
            access: FeatureAccessMode.ALL,
            // category?: "config" | "diagnostic";
            type: "composite",
            property: "color",
            features: [
                { ...numericFeature, name: "hue", property: "hue" },
                { ...numericFeature, name: "saturation", property: "saturation" },
            ],
        },
    ],
};

export const switchFeature: SwitchFeature = {
    name: "my_switch_feature",
    label: "My Switch Feature",
    access: FeatureAccessMode.ALL,
    // category?: "config" | "diagnostic";
    type: "switch",
    property: "my_switch_feature",
    features: [{ ...binaryFeature, value_on: "ON", value_off: "OFF" }],
};

export const lockFeature: LockFeature = {
    name: "my_lock_feature",
    label: "My Lock Feature",
    access: FeatureAccessMode.ALL,
    // category?: "config" | "diagnostic";
    type: "lock",
    property: "my_lock_feature",
    features: [
        { ...binaryFeature, value_on: "LOCKED", value_off: "UNLOCKED" },
        {
            ...enumFeature,
            name: "lock_state",
            property: "actual_state",
            values: ["not_fully_locked", "locked", "unlocked"],
            access: FeatureAccessMode.STATE,
        },
    ],
};

export const coverFeature: CoverFeature = {
    name: "my_cover_feature",
    label: "My Cover Feature",
    access: FeatureAccessMode.ALL,
    // category?: "config" | "diagnostic";
    type: "cover",
    property: "my_cover_feature",
    features: [
        {
            ...enumFeature,
            name: "state",
            property: "state",
            values: ["OPEN", "CLOSE", "STOP"],
            access: FeatureAccessMode.STATE_SET,
        },
        {
            ...numericFeature,
            name: "position",
            property: "position",
            value_min: 0,
            value_max: 100,
            description: "Position of this cover",
            unit: "%",
        },
    ],
};

export const fanFeature: FanFeature = {
    name: "my_fan_feature",
    label: "My Fan Feature",
    access: FeatureAccessMode.ALL,
    // category?: "config" | "diagnostic";
    type: "fan",
    property: "my_fan_feature",
    features: [
        { ...binaryFeature, name: "fan_state", property: "fan_state", description: "On/off state of this fan" },
        {
            ...enumFeature,
            name: "mode",
            property: "mode",
            description: "Mode of this fan",
            values: ["off", "low", "smart", "medium", "high", "on"],
        },
    ],
};

export const climateFeature: ClimateFeature = {
    name: "my_climate_feature",
    label: "My Climate Feature",
    access: FeatureAccessMode.ALL,
    // category?: "config" | "diagnostic";
    type: "climate",
    property: "my_climate_feature",
    features: [
        { ...numericFeature, name: "local_temperature", property: "local_temperature", access: FeatureAccessMode.STATE_GET, unit: "°C" },
        {
            ...numericFeature,
            name: "local_temperature_calibration",
            property: "local_temperature_calibration",
            unit: "°C",
            value_min: -5,
            value_max: 5,
            value_step: 0.1,
        },
        {
            ...numericFeature,
            name: "occupied_heating_setpoint",
            property: "occupied_heating_setpoint",
            unit: "°C",
            value_min: 5,
            value_max: 30,
            value_step: 0.5,
            description: "Temperature setpoint",
        },
        {
            ...enumFeature,
            name: "system_mode",
            property: "system_mode",
            description: "Mode of this device",
            values: ["heat"],
        },
        {
            ...enumFeature,
            name: "running_state",
            property: "running_state",
            description: "The current running state",
            values: ["idle", "heat"],
            access: FeatureAccessMode.STATE_GET,
        },
    ],
};

export const binaryFeatureState: DeviceState = {
    state: true,
};

export const numericFeatureState: DeviceState = {
    brightness: 50,
};

export const textFeatureState: DeviceState = {
    my_text_feature: "abcd",
};

export const enumFeatureState: DeviceState = {
    my_enum_feature: "two",
};

export const listFeatureState: DeviceState = {
    my_list_prop: [1, 3, 5],
};

export const compositeFeatureState: DeviceState = {
    my_composite_feature: {
        brightness: 50,
        my_text_feature: "abcd",
    },
};

export const lightFeatureState: DeviceState = {
    state: "OFF",
    brightness: 175,
    color_temp: 366,
    color: {
        hue: 20,
        saturation: 63,
        x: 0.4264,
        y: 0.3611,
    },
};

export const switchFeatureState: DeviceState = {
    state: "ON",
};

export const lockFeatureState: DeviceState = {
    state: "LOCKED",
    actual_state: "not_fully_locked",
};

export const coverFeatureState: DeviceState = {
    state: "OPEN",
    position: 25,
};

export const fanFeatureState: DeviceState = {
    fan_state: true,
    mode: "smart",
};

export const climateFeatureState: DeviceState = {
    local_temperature: 21,
    local_temperature_calibration: 0.3,
    occupied_heating_setpoint: 22,
    system_mode: "heat",
    running_state: "idle",
};
