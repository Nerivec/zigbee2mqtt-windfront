import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatOtaFileVersion } from "./index.js";

type OtaFileVersionProps = {
    version?: number | null;
    showRaw?: true;
};

const OtaFileVersion = memo(({ version, showRaw }: OtaFileVersionProps) => {
    const { t } = useTranslation("ota");
    const versions = useMemo(() => formatOtaFileVersion(version), [version]);

    return versions === undefined ? (
        <span>N/A</span>
    ) : (
        <div className={`flex flex-col ${showRaw ? "" : "tooltip tooltip-top"}`} data-tip={version}>
            <span>
                {t(($) => $.app)}: {`${versions[0]} build ${versions[1]}`}
            </span>
            <span>
                {t(($) => $.stack)}: {`${versions[2]} build ${versions[3]}`}
            </span>
            {showRaw ? <span className="text-base-content/75">{version}</span> : null}
        </div>
    );
});

export default OtaFileVersion;
