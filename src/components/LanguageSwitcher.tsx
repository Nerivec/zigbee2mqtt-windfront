import { type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DialogDropdown from "./DialogDropdown.js";

const LOCALES_NAMES_MAP = {
    bg: "Български",
    ca: "Català",
    "zh-CN": "简体中文",
    cs: "Česky",
    da: "Dansk",
    de: "Deutsch",
    es: "Español",
    eu: "Euskera",
    fi: "Suomi",
    fr: "Français",
    hu: "Magyar",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
    nl: "Nederlands",
    no: "Norsk",
    pl: "Polski",
    ptbr: "Brazilian Portuguese",
    ru: "Русский",
    sv: "Svenska",
    tr: "Türkçe",
    zh: "繁體中文",
    ua: "Українська",
    en: "English",
};

const LanguageSwitcher = memo(() => {
    const { i18n } = useTranslation("localeNames");
    const currentLanguage = LOCALES_NAMES_MAP[i18n.language] ? i18n.language : i18n.language.split("-")[0];
    const children = useMemo(() => {
        const languages: JSX.Element[] = [];

        for (const language in i18n.options.resources ?? []) {
            languages.push(
                <li
                    key={language}
                    onClick={async () => await i18n.changeLanguage(language)}
                    onKeyUp={async (e) => {
                        if (e.key === "enter") {
                            await i18n.changeLanguage(language);
                        }
                    }}
                >
                    <span className={`dropdown-item${language === currentLanguage ? " menu-active" : ""}`}>
                        {LOCALES_NAMES_MAP[language]}
                        {language === "en" ? null : <span className="text-xs text-warning">AI</span>}
                    </span>
                </li>,
            );
        }

        return languages;
    }, [currentLanguage, i18n.changeLanguage, i18n.options.resources]);

    return (
        <DialogDropdown buttonChildren={currentLanguage} buttonStyle="btn-outline btn-primary">
            {children}
        </DialogDropdown>
    );
});

export default LanguageSwitcher;
