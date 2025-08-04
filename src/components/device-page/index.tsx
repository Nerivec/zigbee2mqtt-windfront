import { type Device, FeatureAccessMode, type Group, type Scene } from "../../types.js";

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

const BLACKLISTED_PARTIAL_FEATURE_NAMES = ["schedule_", "_mode", "_options", "_startup", "_type", "inching_", "cyclic_", "_scene"];

const BLACKLISTED_FEATURE_NAMES = ["effect", "power_on_behavior", "gradient"];

const WHITELIST_FEATURE_NAMES = ["state", "color_temp", "color", "transition", "brightness"];

export const isValidForScenes = (name: string | undefined, access: FeatureAccessMode): boolean => {
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
