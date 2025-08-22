import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import get from "lodash/get.js";
import pick from "lodash/pick.js";

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
const enBaseKeys = Object.keys(enTranslations);

for (const localFile of readdirSync(LOCALES_PATH)) {
    if (localFile === EN_LOCALE_FILE) {
        continue;
    }

    const translations = JSON.parse(readFileSync(`${LOCALES_PATH}${localFile}`, "utf8"));
    const ordered = pick(translations, enBaseKeys);

    for (const key in ordered) {
        ordered[key] = pick(
            ordered[key],
            enKeys.filter((k) => k.startsWith(`${key}.`)).map((k) => k.slice(key.length + 1)),
        );
    }

    writeFileSync(`${LOCALES_PATH}${localFile}`, JSON.stringify(ordered, undefined, 4), "utf8");
}
