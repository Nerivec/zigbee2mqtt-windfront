import enTranslations from "./i18n/locales/en.json" with { type: "json" };

declare module "i18next" {
    interface CustomTypeOptions {
        enableSelector: true;
        defaultNS: "common";
        resources: typeof enTranslations;
    }
}
