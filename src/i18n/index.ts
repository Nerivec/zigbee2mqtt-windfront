import i18n, { type ResourceLanguage } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { register } from "timeago.js";
import timeBg from "timeago.js/lib/lang/bg.js";
import timeCa from "timeago.js/lib/lang/ca.js";
import timeCs from "timeago.js/lib/lang/cs.js";
import timeDa from "timeago.js/lib/lang/da.js";
import timeDe from "timeago.js/lib/lang/de.js";
import timeEs from "timeago.js/lib/lang/es.js";
import timeEu from "timeago.js/lib/lang/eu.js";
import timeFi from "timeago.js/lib/lang/fi.js";
import timeFR from "timeago.js/lib/lang/fr.js";
import timeHu from "timeago.js/lib/lang/hu.js";
import timeIt from "timeago.js/lib/lang/it.js";
import timeJa from "timeago.js/lib/lang/ja.js";
import timeKo from "timeago.js/lib/lang/ko.js";
import timeNo from "timeago.js/lib/lang/nb_NO.js";
import timeNl from "timeago.js/lib/lang/nl.js";
import timePl from "timeago.js/lib/lang/pl.js";
import timePtBr from "timeago.js/lib/lang/pt_BR.js";
import timeRu from "timeago.js/lib/lang/ru.js";
// import timeSk from "timeago.js/lib/lang/sk.js";
import timeSv from "timeago.js/lib/lang/sv.js";
import timeTr from "timeago.js/lib/lang/tr.js";
import timeUa from "timeago.js/lib/lang/uk.js";
import timeVi from "timeago.js/lib/lang/vi.js";
import timeZhCn from "timeago.js/lib/lang/zh_CN.js";
import timeZh from "timeago.js/lib/lang/zh_TW.js";
import bgTranslations from "./locales/bg.json" with { type: "json" };
import caTranslations from "./locales/ca.json" with { type: "json" };
import csTranslations from "./locales/cs.json" with { type: "json" };
import daTranslations from "./locales/da.json" with { type: "json" };
import deTranslations from "./locales/de.json" with { type: "json" };
import enTranslations from "./locales/en.json" with { type: "json" };
import esTranslations from "./locales/es.json" with { type: "json" };
import euTranslations from "./locales/eu.json" with { type: "json" };
import fiTranslations from "./locales/fi.json" with { type: "json" };
import frTranslations from "./locales/fr.json" with { type: "json" };
import huTranslations from "./locales/hu.json" with { type: "json" };
import itTranslations from "./locales/it.json" with { type: "json" };
import jaTranslations from "./locales/ja.json" with { type: "json" };
import koTranslations from "./locales/ko.json" with { type: "json" };
import nlTranslations from "./locales/nl.json" with { type: "json" };
import noTranslations from "./locales/no.json" with { type: "json" };
import plTranslations from "./locales/pl.json" with { type: "json" };
import ptbrTranslations from "./locales/ptbr.json" with { type: "json" };
import ruTranslations from "./locales/ru.json" with { type: "json" };
import skTranslations from "./locales/sk.json" with { type: "json" };
import svTranslations from "./locales/sv.json" with { type: "json" };
import trTranslations from "./locales/tr.json" with { type: "json" };
import uaTranslations from "./locales/ua.json" with { type: "json" };
import viTranslations from "./locales/vi.json" with { type: "json" };
import zhTranslations from "./locales/zh.json" with { type: "json" };
import zhCnTranslations from "./locales/zh-CN.json" with { type: "json" };

function timeSk(number: number, index: number): [string, string] {
    let inflectionIndex = 0;

    if ((index === 1 || index === 3 || index === 5 || index === 7 || index === 9 || index === 11 || index === 13) && number >= 5) {
        inflectionIndex = 1;
    }

    return [
        [["práve teraz", "práve teraz"]],
        [
            ["pred %s sekundami", "o %s sekundy"],
            ["pred %s sekundami", "o %s sekúnd"],
        ],
        [["pred minútou", "o minútu"]],
        [
            ["pred %s minútami", "o %s minúty"],
            ["pred %s minútami", "o %s minút"],
        ],
        [["pred hodinou", "o hodinu"]],
        [
            ["pred %s hodinami", "o %s hodiny"],
            ["pred %s hodinami", "o %s hodín"],
        ],
        [["včera", "zajtra"]],
        [
            ["pred %s dňami", "o %s dni"],
            ["pred %s dňami", "o %s dní"],
        ],
        [["minulý týždeň", "budúci týždeň"]],
        [
            ["pred %s týždňami", "o %s týždne"],
            ["pred %s týždňami", "o %s týždňov"],
        ],
        [["minulý mesiac", "budúci mesiac"]],
        [
            ["pred %s mesiacmi", "o %s mesiace"],
            ["pred %s mesiacmi", "o %s mesiacov"],
        ],
        [["pred rokom", "budúci rok"]],
        [
            ["pred %s rokmi", "o %s roky"],
            ["pred %s rokmi", "o %s rokov"],
        ],
    ][index][inflectionIndex] as [string, string];
}

register("bg", timeBg);
register("ca", timeCa);
register("cs", timeCs);
register("da", timeDa);
register("de", timeDe);
register("es", timeEs);
register("eu", timeEu);
register("fi", timeFi);
register("fr", timeFR);
register("hu", timeHu);
register("it", timeIt);
register("ja", timeJa);
register("ko", timeKo);
register("nl", timeNl);
register("no", timeNo);
register("pl", timePl);
register("ptbr", timePtBr);
register("ru", timeRu);
register("sk", timeSk);
register("sv", timeSv);
register("tr", timeTr);
register("ua", timeUa);
register("vi", timeVi);
register("zh", timeZh);
register("zh-CN", timeZhCn);

const resources = {
    bg: bgTranslations as ResourceLanguage,
    ca: caTranslations as ResourceLanguage,
    cs: csTranslations as ResourceLanguage,
    da: daTranslations as ResourceLanguage,
    de: deTranslations as ResourceLanguage,
    en: enTranslations as ResourceLanguage,
    es: esTranslations as ResourceLanguage,
    eu: euTranslations as ResourceLanguage,
    fi: fiTranslations as ResourceLanguage,
    fr: frTranslations as ResourceLanguage,
    hu: huTranslations as ResourceLanguage,
    it: itTranslations as ResourceLanguage,
    ja: jaTranslations as ResourceLanguage,
    ko: koTranslations as ResourceLanguage,
    nl: nlTranslations as ResourceLanguage,
    no: noTranslations as ResourceLanguage,
    pl: plTranslations as ResourceLanguage,
    ptbr: ptbrTranslations as ResourceLanguage,
    ru: ruTranslations as ResourceLanguage,
    sk: skTranslations as ResourceLanguage,
    sv: svTranslations as ResourceLanguage,
    tr: trTranslations as ResourceLanguage,
    ua: uaTranslations as ResourceLanguage,
    vi: viTranslations as ResourceLanguage,
    zh: zhTranslations as ResourceLanguage,
    "zh-CN": zhCnTranslations as ResourceLanguage,
} as const;

const debug = process.env.NODE_ENV !== "production";

i18n.on("languageChanged", (lng: string) => {
    document.documentElement.lang = lng;
});

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        debug,
        resources,
        ns: Object.keys(enTranslations),
        defaultNS: "common",
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

let savedLang: string | null = null;

if (!savedLang) {
    i18n.changeLanguage("en");
} else {
    const rawLang = (i18n.language ?? "").toString();
    const currentLanguage = (rawLang ? rawLang.split("-")[0] : "").toLowerCase();

    if (!currentLanguage || !(currentLanguage in resources)) {
        i18n.changeLanguage("en");
    }
}

export default i18n;
