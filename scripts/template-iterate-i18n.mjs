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

// TODO here goes work before reading each locale file

for (const localFile of readdirSync(LOCALES_PATH)) {
    const translations = JSON.parse(readFileSync(`${LOCALES_PATH}${localFile}`, "utf8"));

    for (const key of enKeys) {
        // get the current file value at given path
        // biome-ignore lint/correctness/noUnusedVariables: template
        const translation = get(translations, key);

        // TODO here goes work for each translation by key
    }

    // TODO here goes work on specific file
}
