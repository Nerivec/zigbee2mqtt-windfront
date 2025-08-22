import { readdirSync, readFileSync } from "node:fs";
import get from "lodash/get.js";

const LOCALES_PATH = "./src/i18n/locales/";
const EN_LOCALE_FILE = "en.json";

const isObject = (value) => value !== null && typeof value === "object";

const enTranslations = JSON.parse(readFileSync(`${LOCALES_PATH}${EN_LOCALE_FILE}`, "utf8"));

const getKeys = (content, path) => {
    const keys = [];
    const obj = path ? get(content, path) : content;

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

/**
 * Structure:
 *   - file: the locale file where the untranslated item is (in `src/i18n/locales` directory)
 *   - path: the keys path to reach the untranslated value in said file's JSON structure (can be used with `lodash` `get` & `set` once file is loaded and parsed)
 *   - value: the untranslated value
 */
const untranslated = [];

for (const localFile of readdirSync(LOCALES_PATH)) {
    if (localFile === EN_LOCALE_FILE) {
        continue;
    }

    const translations = JSON.parse(readFileSync(`${LOCALES_PATH}${localFile}`, "utf8"));

    for (const key of enKeys) {
        // get the EN reference value at given path
        const enTranslation = get(enTranslations, key);
        // get the current file value at given path
        const translation = get(translations, key);

        // if translations match, it means the current file value is completely untranslated
        if (enTranslation === translation) {
            untranslated.push({
                file: localFile,
                path: key,
                value: enTranslation,
            });
        }
    }
}

console.log(untranslated);

// return the untranslated values for use in other scripts
export default untranslated;
