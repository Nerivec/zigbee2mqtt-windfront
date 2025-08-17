import type {
    Zigbee2MQTTAPI,
    Zigbee2MQTTDevice,
    Zigbee2MQTTFeatures,
    Zigbee2MQTTGroup,
    Zigbee2MQTTResponse,
    Zigbee2MQTTResponseEndpoints,
    Zigbee2MQTTScene,
    Zigbee2MQTTSettings,
} from "zigbee2mqtt";

export type RecursiveMutable<T> = { -readonly [K in keyof T]: RecursiveMutable<T[K]> };

export type OmitFunctions<T> = {
    // biome-ignore lint/complexity/noBannedTypes: generic type
    [K in keyof T as T[K] extends Function ? never : K]: T[K] extends Array<unknown> ? OmitFunctions<T[K][number]>[] : OmitFunctions<T[K]>;
};

// #region Z2M

export type PowerSource =
    | "Unknown"
    | "Mains (single phase)"
    | "Mains (3 phase)"
    | "Battery"
    | "DC Source"
    | "Emergency mains constantly powered"
    | "Emergency mains and transfer switch";

export type Device = OmitFunctions<Zigbee2MQTTDevice>;

export type Group = Zigbee2MQTTGroup;

export type Scene = Zigbee2MQTTScene;

export type LastSeenConfig = Zigbee2MQTTSettings["advanced"]["last_seen"];

export type DeviceState = Zigbee2MQTTAPI["{friendlyName}"];

export type BridgeInfo = Zigbee2MQTTAPI["bridge/info"];

export type TouchlinkDevice = Zigbee2MQTTAPI["bridge/response/touchlink/scan"]["found"][number];

export type LogMessage = Zigbee2MQTTAPI["bridge/logging"] & { timestamp: string };

export type AvailabilityState = Zigbee2MQTTAPI["{friendlyName}/availability"];

export type ClusterDefinition = RecursiveMutable<
    Zigbee2MQTTAPI["bridge/definitions"]["clusters"][keyof Zigbee2MQTTAPI["bridge/definitions"]["clusters"]]
>;

export type AttributeDefinition = RecursiveMutable<ClusterDefinition["attributes"][number]>;

export interface Message<T = string | Record<string, unknown> | Record<string, unknown>[] | string[]> {
    topic: string;
    payload: T;
}

export interface ResponseMessage<T extends Zigbee2MQTTResponseEndpoints> extends Message {
    payload: Zigbee2MQTTResponse<T>;
}

// #endregion

// #region ZHC

export type BasicFeatureType = "binary" | "list" | "numeric" | "enum" | "text";

export type FeatureWithSubFeaturesType = "switch" | "lock" | "composite" | "light" | "cover" | "fan" | "climate";

export enum FeatureAccessMode {
    /**
     * Bit 0: The property can be found in the published state of this device
     */
    STATE = 0b001,
    /**
     * Bit 1: The property can be set with a /set command
     */
    SET = 0b010,
    /**
     * Bit 2: The property can be retrieved with a /get command
     */
    GET = 0b100,
    /**
     * Bitwise inclusive OR of STATE and SET : 0b001 | 0b010
     */
    STATE_SET = 0b011,
    /**
     * Bitwise inclusive OR of STATE and GET : 0b001 | 0b100
     */
    STATE_GET = 0b101,
    /**
     * Bitwise inclusive OR of STATE and GET and SET : 0b001 | 0b100 | 0b010
     */
    ALL = 0b111,
}

type PublishedZigbee2MQTTFeatures = OmitFunctions<Zigbee2MQTTFeatures>;

// fix `.features` type that isn't properly handled by `OmitFunctions`
type PublishedBasicFeature<T extends BasicFeatureType> = Omit<PublishedZigbee2MQTTFeatures[T], "features">;
type PublishedFeatureWithSubFeatures<T extends FeatureWithSubFeaturesType> = Omit<PublishedZigbee2MQTTFeatures[T], "features"> &
    Required<Pick<PublishedZigbee2MQTTFeatures[T], "features">>;

export type BinaryFeature = PublishedBasicFeature<"binary">;

export type ListFeature = PublishedBasicFeature<"list">;

export type NumericFeature = PublishedBasicFeature<"numeric">;

export type TextFeature = PublishedBasicFeature<"text">;

export type EnumFeature = PublishedBasicFeature<"enum">;

export type CompositeFeature = PublishedFeatureWithSubFeatures<"composite">;

export type LightFeature = PublishedFeatureWithSubFeatures<"light">;

export type SwitchFeature = PublishedFeatureWithSubFeatures<"switch">;

export type CoverFeature = PublishedFeatureWithSubFeatures<"cover">;

export type LockFeature = PublishedFeatureWithSubFeatures<"lock">;

export type FanFeature = PublishedFeatureWithSubFeatures<"fan">;

export type ClimateFeature = PublishedFeatureWithSubFeatures<"climate">;

export type GradientFeature = ListFeature & {
    name: "gradient";
    item_type: "text";
    length_min: number;
    length_max: number;
};

export type ColorFeature = CompositeFeature & {
    name: "color_xy" | "color_hs";
    features: PublishedBasicFeature<"numeric">[];
};

export type BasicFeature = BinaryFeature | ListFeature | NumericFeature | TextFeature | EnumFeature;

export type FeatureWithSubFeatures = CompositeFeature | LightFeature | SwitchFeature | CoverFeature | LockFeature | FanFeature | ClimateFeature;

// fix generic assigning from e.g. device definition `exposes` & `options`
export type WithAnySubFeatures<T> = Omit<T, "features"> & { features: (BasicFeature | WithAnySubFeatures<FeatureWithSubFeatures>)[] };

export type FeatureWithAnySubFeatures =
    | BasicFeature
    | WithAnySubFeatures<CompositeFeature>
    | WithAnySubFeatures<LightFeature>
    | WithAnySubFeatures<SwitchFeature>
    | WithAnySubFeatures<CoverFeature>
    | WithAnySubFeatures<LockFeature>
    | WithAnySubFeatures<FanFeature>
    | WithAnySubFeatures<ClimateFeature>;

export type AnySubFeature = BasicFeature | WithAnySubFeatures<FeatureWithSubFeatures>;

// #endregion

// #region Utils

export type Toast = { sourceIdx: number; topic: string; status: "ok" | "error"; error: string | undefined; transaction?: string };

export type RGBColor = {
    r: number;
    g: number;
    b: number;
};

export type HueSaturationColor = {
    hue: number;
    saturation: number;
};

export type XYColor = {
    x: number;
    y: number;
    Y?: number;
};

export type HexColor = {
    hex: string;
};

export type AnyColor = RGBColor | XYColor | HueSaturationColor | HexColor;

export type ColorFormat = "color_rgb" | "color_xy" | "color_hs" | "hex";

// #endregion
