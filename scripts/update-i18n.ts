import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import difference from "lodash/difference.js";
import get from "lodash/get.js";
import set from "lodash/set.js";
import unset from "lodash/unset.js";

const LOCALES_PATH = "./src/i18n/locales/";
const EN_LOCALE_FILE = "en.json";

const isObject = (value: unknown) => value !== null && typeof value === "object";

const enTranslations = JSON.parse(readFileSync(`${LOCALES_PATH}${EN_LOCALE_FILE}`, "utf8"));

const getKeys = (content: Record<string, unknown>, path?: string) => {
    const keys: string[] = [];
    const obj = path ? (get(content, path) as Record<string, unknown>) : content;

    for (const key in obj) {
        const newPath = path ? `${path}.${key}` : key;

        if (isObject(obj[key])) {
            const nestedKeys = getKeys(obj, newPath);

            keys.push(...nestedKeys);
        } else {
            keys.push(newPath);
        }
    }

    return keys;
};

const enKeys = getKeys(enTranslations);

const missingByFile: Record<string, string[]> = {};

for (const localFile of readdirSync(LOCALES_PATH)) {
    if (localFile === EN_LOCALE_FILE) {
        continue;
    }

    const filePath = `${LOCALES_PATH}${localFile}`;
    const translations = JSON.parse(readFileSync(filePath, "utf8"));
    const keys = getKeys(translations);

    if (keys.length !== 0) {
        const missing = difference(enKeys, keys);

        if (missing.length !== 0) {
            console.error(`[${localFile}]: Missing keys:`);
            console.error(missing);

            for (const missingEntry of missing) {
                set(translations, missingEntry, get(enTranslations, missingEntry));
            }

            missingByFile[filePath] = missing;
        }

        const removed = difference(keys, enKeys);

        if (removed.length !== 0) {
            console.error(`[${localFile}]: Invalid keys:`);
            console.error(removed);

            for (const removedEntry of removed) {
                unset(translations, removedEntry);
            }
        }
    }

    writeFileSync(filePath, JSON.stringify(translations, undefined, 4), "utf8");
}
