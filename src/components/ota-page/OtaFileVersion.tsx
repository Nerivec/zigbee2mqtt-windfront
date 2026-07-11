import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatOtaFileVersion } from "./index.js";
import { faCheckCircle, faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type OtaFileVersionProps = {
    version?: number | null;
    showRaw?: true;
    state?: string;
    source?: string | null;
};

const OtaFileVersion = memo(({ version, showRaw, state, source }: OtaFileVersionProps) => {
    const { t } = useTranslation("ota");
    const versions = useMemo(() => formatOtaFileVersion(version), [version]);

    if (versions === undefined) {
        return <span>{t(($) => $.not_assessed)}</span>;
    }

    const sourceDisplay = source ? (() => {
        const isOfficial = source.startsWith("https://raw.githubusercontent.com/Koenkk/zigbee-OTA");
        const title = t(($) => (isOfficial ? $.official_source : $.custom_source));
        const icon = isOfficial ? faCheckCircle : faSquareArrowUpRight;
        const iconClass = isOfficial ? "text-success" : "text-info";

        return (
            <span title={title} className="inline-flex items-center ml-1">
                <FontAwesomeIcon icon={icon} className={`indicator-item indicator-bottom indicator-end ${iconClass}`} />
            </span>
        );
    })() : undefined;

    if (state === "idle") {
        return (
            <span className="flex flex-row">
                <span>{t(($) => $.up_to_date)}</span>
                {sourceDisplay}
            </span>
        );
    }

    return (
        <span className="flex flex-row">
            <div className={`flex flex-col ${showRaw ? "" : "tooltip tooltip-top"}`} data-tip={version}>
                <span>
                    {t(($) => $.app)}: {`${versions[0]} build ${versions[1]}`}
                </span>
                <span>
                    {t(($) => $.stack)}: {`${versions[2]} build ${versions[3]}`}
                </span>
                {showRaw ? <span className="font-mono text-base-content/75">{version}</span> : null}
            </div>
            {sourceDisplay}
        </span>
    );
});

export default OtaFileVersion;
