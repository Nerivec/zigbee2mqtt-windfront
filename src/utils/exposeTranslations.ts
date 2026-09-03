import type { Device, FeatureWithAnySubFeatures } from "../types.js";

type LocaleExposeTranslation = {
    label?: string;
    description?: string;
    values?: Record<string, string>;
};

type BackendLocaleTranslations = {
    label?: string;
    description?: string;
    values?: Record<string, string>;
    exposes?: Record<string, LocaleExposeTranslation>;
};

type WithTranslations = { translations?: Record<string, BackendLocaleTranslations> };

function getTranslations(feature: FeatureWithAnySubFeatures): Record<string, LocaleExposeTranslation> | undefined {
    const raw = (feature as unknown as WithTranslations).translations;
    if (!raw) return undefined;

    const flat: Record<string, LocaleExposeTranslation> = {};

    for (const [locale, localeData] of Object.entries(raw)) {
        if (!localeData) continue;

        if (localeData.exposes) {
            flat[locale] = {};
            for (const entry of Object.values(localeData.exposes)) {
                if (entry.label) flat[locale].label = entry.label;
                if (entry.description) flat[locale].description = entry.description;
                if (entry.values) flat[locale].values = { ...(flat[locale].values ?? {}), ...entry.values };
            }
        } else {
            flat[locale] = localeData as LocaleExposeTranslation;
        }
    }

    return flat;
}

export function getExposeLabel(feature: FeatureWithAnySubFeatures, locale: string): string {
    return getTranslations(feature)?.[locale]?.label ?? feature.label;
}

export function getExposeDescription(feature: FeatureWithAnySubFeatures, locale: string): string | undefined {
    return getTranslations(feature)?.[locale]?.description ?? feature.description;
}

export function getExposeValueLabel(value: string, translations: Record<string, BackendLocaleTranslations> | undefined, locale: string): string {
    const localeData = translations?.[locale];
    if (!localeData) return value.charAt(0).toUpperCase() + value.slice(1);

    if (localeData.values) return localeData.values[value] ?? value.charAt(0).toUpperCase() + value.slice(1);

    if (localeData.exposes) {
        for (const entry of Object.values(localeData.exposes)) {
            if (entry.values?.[value]) return entry.values[value];
        }
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}

type DeviceDefinitionTranslations = {
    description?: string;
    exposes?: Record<string, LocaleExposeTranslation>;
};

type DeviceDefinition = {
    description?: string;
    translations?: Record<string, DeviceDefinitionTranslations>;
};

export function getDeviceDescription(device: Device, locale: string): string | undefined {
    const definition = device.definition as DeviceDefinition | undefined;
    return definition?.translations?.[locale]?.description ?? definition?.description;
}
