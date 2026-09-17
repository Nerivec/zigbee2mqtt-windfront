import { useCallback, useSyncExternalStore } from "react";
import { resolveTemperatureUnitPreference, TEMPERATURE_SETTINGS_EVENT, type TemperatureUnitPreference } from "../temperature.js";
import type { Device, NumericFeature } from "../types.js";

function subscribe(callback: () => void): () => void {
    window.addEventListener(TEMPERATURE_SETTINGS_EVENT, callback);
    window.addEventListener("storage", callback);

    return () => {
        window.removeEventListener(TEMPERATURE_SETTINGS_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}

export default function useTemperatureUnit(device: Device, feature: NumericFeature): TemperatureUnitPreference {
    const getSnapshot = useCallback(() => resolveTemperatureUnitPreference(device, feature), [device, feature]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
