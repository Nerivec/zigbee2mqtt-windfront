import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const LOCALES_PATH = "./src/i18n/locales/";

const { compare } = new Intl.Collator("en");

const sortJsonKeys = (json: unknown) => {
    if (json !== null && !Array.isArray(json) && typeof json === "object") {
        const keys = Object.keys(json).sort(compare);
        const result: Record<string, unknown> = {};

        for (const key of keys) {
            result[key] = sortJsonKeys((json as Record<string, unknown>)[key]);
        }

        return result;
    }

    return json;
};

for (const localFile of readdirSync(LOCALES_PATH)) {
    const translations = JSON.parse(readFileSync(`${LOCALES_PATH}${localFile}`, "utf8"));
    const ordered = sortJsonKeys(translations);

    writeFileSync(`${LOCALES_PATH}${localFile}`, JSON.stringify(ordered, undefined, 4), "utf8");
}
