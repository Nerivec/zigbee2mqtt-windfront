import type { Device, FeatureWithAnySubFeatures } from "../types.js";

type WithTranslations = {translations?: Record<string, {label?: string; description?: string; values?: Record<string, string>}>};

function getTranslations(feature: FeatureWithAnySubFeatures): Record<string, {label?: string; description?: string; values?: Record<string, string>}> | undefined {
    return (feature as unknown as WithTranslations).translations;
}

export function getExposeLabel(feature: FeatureWithAnySubFeatures, locale: string): string {
    return getTranslations(feature)?.[locale]?.label ?? feature.label;
}

export function getExposeDescription(feature: FeatureWithAnySubFeatures, locale: string): string | undefined {
    return getTranslations(feature)?.[locale]?.description ?? feature.description;
}

export function getExposeValueLabel(value: string, translations: Record<string, {label?: string; values?: Record<string, string>}> | undefined, locale: string): string {
    return translations?.[locale]?.values?.[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

type DeviceDefinitionTranslations = {
    description?: string;
    exposes?: Record<string, {label?: string; description?: string; values?: Record<string, string>}>;
};

type DeviceDefinition = {
    description?: string;
    translations?: Record<string, DeviceDefinitionTranslations>;
};

export function getDeviceDescription(device: Device, locale: string): string | undefined {
    const definition = device.definition as DeviceDefinition | undefined;
    return definition?.translations?.[locale]?.description ?? definition?.description;
}
