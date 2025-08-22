import { readdirSync, readFileSync } from "node:fs";
import { exit } from "node:process";
import difference from "lodash/difference.js";
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

let error = false;

for (const localFile of readdirSync(LOCALES_PATH)) {
    if (localFile === EN_LOCALE_FILE) {
        continue;
    }

    const translations = JSON.parse(readFileSync(`${LOCALES_PATH}${localFile}`, "utf8"));
    const keys = getKeys(translations);

    if (keys.length !== 0) {
        const missing = difference(enKeys, keys);

        if (missing.length !== 0) {
            console.error(`[${localFile}]: Missing keys:`);
            console.error(missing);

            error = true;
        }

        const removed = difference(keys, enKeys);

        if (removed.length !== 0) {
            console.error(`[${localFile}]: Invalid keys:`);
            console.error(removed);

            error = true;
        }
    }
}

if (error) {
    exit(1);
}
