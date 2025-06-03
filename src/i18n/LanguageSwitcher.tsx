import { type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PopoverDropdown from "../components/PopoverDropdown.js";

import bg from "./flags/bg.png";
import ca from "./flags/ca.png";
import chs from "./flags/cn.png";
import cs from "./flags/cz.png";
import da from "./flags/da.png";
import de from "./flags/de.png";
import es from "./flags/es.png";
import eu from "./flags/eu.png";
import fi from "./flags/fi.png";
import fr from "./flags/fr.png";
import hu from "./flags/hu.png";
import it from "./flags/it.png";
import ko from "./flags/kr.png";
import missing from "./flags/missing-locale.png";
import nl from "./flags/nl.png";
import no from "./flags/no.png";
import pl from "./flags/pl.png";
import ptbr from "./flags/ptbr.png";
import ru from "./flags/ru.png";
import sv from "./flags/sv.png";
import tr from "./flags/tr.png";
import zh from "./flags/tw.png";
import ua from "./flags/ua.png";
import en from "./flags/uk.png";

const LOCALES_MAP = {
    bg,
    ca,
    "zh-CN": chs,
    cs,
    da,
    de,
    es,
    eu,
    fi,
    fr,
    hu,
    it,
    ko,
    nl,
    no,
    pl,
    ptbr,
    ru,
    sv,
    tr,
    zh,
    ua,
    en,
};

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
    const currentLanguage = useMemo(() => (LOCALES_MAP[i18n.language] ? i18n.language : i18n.language.split("-")[0]), [i18n.language]);
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
                    <span className="btn btn-block btn-ghost">{LOCALES_NAMES_MAP[language]}</span>
                </li>,
            );
        }

        return languages;
    }, [i18n.changeLanguage, i18n.options.resources]);

    return (
        <PopoverDropdown
            name="locale-picker"
            buttonChildren={
                <img src={LOCALES_MAP[currentLanguage] ?? missing} alt={LOCALES_NAMES_MAP[currentLanguage]} style={{ maxWidth: "80%" }} />
            }
            buttonStyle="mx-1"
            dropdownStyle="dropdown-end"
        >
            {children}
        </PopoverDropdown>
    );
});

export default LanguageSwitcher;
