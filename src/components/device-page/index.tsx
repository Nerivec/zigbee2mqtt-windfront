import {
    type AnySubFeature,
    type BasicFeature,
    type Device,
    FeatureAccessMode,
    type FeatureWithAnySubFeatures,
    type FeatureWithSubFeatures,
    type Group,
    type Scene,
} from "../../types.js";

import { isDevice } from "../../utils.js";

export function getScenes(target: Group | Device): Scene[] {
    if (isDevice(target)) {
        const scenes: Scene[] = [];

        for (const key in target.endpoints) {
            const ep = target.endpoints[key];

            for (const scene of ep.scenes) {
                scenes.push({ ...scene });
            }
        }

        return scenes;
    }

    return target.scenes;
}

const BLACKLISTED_PARTIAL_FEATURE_NAMES = ["schedule_", "_mode", "_options", "_startup", "_type", "inching_", "cyclic_"];

const BLACKLISTED_FEATURE_NAMES = ["effect"];

const WHITELIST_FEATURE_NAMES = ["state", "color_temp", "color", "transition", "brightness"];

const isValid = (name: string | undefined, access: FeatureAccessMode): boolean => {
    if (name) {
        if (WHITELIST_FEATURE_NAMES.includes(name)) {
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

    return !access || access === FeatureAccessMode.ALL || access === FeatureAccessMode.SET || access === FeatureAccessMode.STATE_SET;
};

export function getScenesFeatures(feature: BasicFeature | FeatureWithSubFeatures): FeatureWithAnySubFeatures | undefined {
    const { name, access } = feature;

    if (!isValid(name, access)) {
        return undefined;
    }

    if ("features" in feature && feature.features && feature.features.length > 0) {
        const features: AnySubFeature[] = [];

        for (const subFeature of feature.features) {
            const validFeature = getScenesFeatures(subFeature);

            if (validFeature && !features.some((f) => f.property === validFeature.property)) {
                features.push(validFeature);
            }
        }

        return { ...feature, features };
    }

    return { ...feature };
}
