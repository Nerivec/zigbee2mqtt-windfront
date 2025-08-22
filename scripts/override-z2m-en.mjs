import { readFileSync, writeFileSync } from "node:fs";

const SETTINGS_SCHEMA_URL = "https://github.com/Koenkk/zigbee2mqtt/raw/refs/heads/dev/lib/util/settings.schema.json";
const EN_LOCALE_PATH = "./src/i18n/locales/en.json";

const isObject = (value) => value !== null && typeof value === "object";

const enTranslations = JSON.parse(readFileSync(EN_LOCALE_PATH, "utf8"));
const schema = await fetch(SETTINGS_SCHEMA_URL);
const settingsSchemaDescriptions = {};

const exportSettingsSchemaDescriptions = (obj, parentPath = "") => {
    for (const key in obj) {
        const value = obj[key];

        if (isObject(value)) {
            exportSettingsSchemaDescriptions(
                value,
                key === "properties" || key === "oneOf" || !Number.isNaN(Number(key)) ? parentPath : parentPath ? `${parentPath}.${key}` : key,
            );
        } else if (key === "description") {
            settingsSchemaDescriptions[parentPath] = value;
        }
    }
};

exportSettingsSchemaDescriptions(await schema.json());

enTranslations.settingsSchemaDescriptions = settingsSchemaDescriptions;

writeFileSync(EN_LOCALE_PATH, JSON.stringify(enTranslations, null, 4), "utf8");
console.log("Z2M override written to:", EN_LOCALE_PATH);
