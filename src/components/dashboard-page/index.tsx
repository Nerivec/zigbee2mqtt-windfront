import type { BasicFeature, FeatureWithSubFeatures } from "../../types.js";

export const isValidForDashboard = (expose: BasicFeature | FeatureWithSubFeatures): boolean => {
    // always ignore configs in dashboard
    // ignore list because of size constraints
    if (expose.category === "config" || expose.type === "list") {
        return false;
    }

    if (expose.name) {
        // specific blacklisting (already shown some other way)
        if (expose.name === "linkquality" || expose.name === "battery" || expose.name === "voltage") {
            return false;
        }
    }

    return true;
};
