import type { AnySubFeature, BasicFeature, DeviceState, FeatureAccessMode, FeatureWithAnySubFeatures, FeatureWithSubFeatures } from "../../types.js";

const BLACKLISTED_PARTIAL_FEATURE_NAMES = ["schedule_", "_mode", "_options", "_startup", "_type", "inching_", "cyclic_"];

const BLACKLISTED_FEATURE_NAMES = [
    "battery",
    "linkquality",
    "options",
    "position",
    "programming",
    "strength",
    "voltage",
    "warning",
    "gradient",
    "power_outage_memory",
    "power_on_behavior",
];

const WHITELISTED_FEATURE_NAMES = ["state", "brightness", "color_temp", "mode", "sound", "occupancy", "tamper", "alarm", "action", "contact"];

const isValid = (name: string | undefined, _access: FeatureAccessMode): boolean => {
    if (name) {
        if (WHITELISTED_FEATURE_NAMES.includes(name)) {
            return true;
        }

        for (const bName of BLACKLISTED_PARTIAL_FEATURE_NAMES) {
            if (name.includes(bName)) {
                return false;
            }
        }

        if (BLACKLISTED_FEATURE_NAMES.includes(name)) {
            return false;
        }
    }

    return true;
};

export const getDashboardFeatures = (
    feature: BasicFeature | FeatureWithSubFeatures,
    deviceState: DeviceState = {},
): FeatureWithAnySubFeatures | undefined => {
    const { property, name, access } = feature;

    if (!isValid(name, access)) {
        return undefined;
    }

    if ("features" in feature && feature.features && feature.features.length > 0) {
        const features: AnySubFeature[] = [];
        const state = property ? (deviceState[property] as DeviceState) : deviceState;

        for (const subFeature of feature.features) {
            const validFeature = getDashboardFeatures(subFeature, state);

            if (validFeature && !features.some((f) => f.property === validFeature.property)) {
                features.push(validFeature);
            }
        }

        return { ...feature, features };
    }

    return { ...feature };
};
