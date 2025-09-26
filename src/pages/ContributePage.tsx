import { faExternalLink, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { CONTRIBUTE_TRANSLATION_URL, CONTRIBUTE_WINDFRONT_URL, CONTRIBUTE_Z2M_URL, CONTRIBUTE_ZH_URL, CONTRIBUTE_ZHC_URL } from "../consts.js";

const DONATE_ROWS = [
    <div key="Nerivec" className="flex flex-col gap-3 items-center">
        <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/Nerivec" className="h-10">
            <img
                alt="Nerivec"
                src="https://img.buymeacoffee.com/button-api/?text=Thanks Nerivec&emoji=☕&slug=Nerivec&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                className="h-10"
            />
        </a>
        <a target="_blank" rel="noopener noreferrer" className="btn btn-secondary" href="https://github.com/sponsors/Nerivec">
            <FontAwesomeIcon icon={faHeart} />
            Sponsor Nerivec on Github
        </a>
    </div>,
    <div key="koenkk" className="flex flex-col gap-3 items-center">
        <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/koenkk" className="h-10">
            <img
                alt="koenkk"
                src="https://img.buymeacoffee.com/button-api/?text=Thanks Koenkk&emoji=☕&slug=koenkk&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                className="h-10"
            />
        </a>
        <a target="_blank" rel="noopener noreferrer" className="btn btn-secondary" href="https://github.com/sponsors/Koenkk">
            <FontAwesomeIcon icon={faHeart} />
            Sponsor Koenkk on Github
        </a>
    </div>,
];

export default function ContributePage() {
    const { t } = useTranslation("contribute");

    return (
        <div className="mb-3">
            <div className="flex flex-col gap-6 items-center">
                <div className="flex flex-col gap-3 items-center">
                    {t("donation_text")}
                    {DONATE_ROWS.sort(() => Math.random() - 0.5)}
                </div>

                <h2 className="text-lg font-bold">{t("development")}</h2>
                <p>{t("contributing")}</p>
                <div className="flex flex-row flex-wrap gap-4 justify-center">
                    <a className="link link-hover link-primary" target="_blank" rel="noopener noreferrer" href={CONTRIBUTE_WINDFRONT_URL}>
                        WindFront
                        <FontAwesomeIcon icon={faExternalLink} size="lg" className="ms-1" />
                    </a>
                    <a className="link link-hover link-primary" target="_blank" rel="noopener noreferrer" href={CONTRIBUTE_TRANSLATION_URL}>
                        {t("translation")}
                        <FontAwesomeIcon icon={faExternalLink} size="lg" className="ms-1" />
                    </a>
                </div>
                <div className="flex flex-row flex-wrap gap-4 justify-center">
                    <a className="link link-hover link-primary" target="_blank" rel="noopener noreferrer" href={CONTRIBUTE_Z2M_URL}>
                        Zigbee2MQTT
                        <FontAwesomeIcon icon={faExternalLink} size="lg" className="ms-1" />
                    </a>
                    <a className="link link-hover link-primary" target="_blank" rel="noopener noreferrer" href={CONTRIBUTE_ZHC_URL}>
                        Zigbee Herdsman Converters
                        <FontAwesomeIcon icon={faExternalLink} size="lg" className="ms-1" />
                    </a>
                    <a className="link link-hover link-primary" target="_blank" rel="noopener noreferrer" href={CONTRIBUTE_ZH_URL}>
                        Zigbee Herdsman
                        <FontAwesomeIcon icon={faExternalLink} size="lg" className="ms-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}
