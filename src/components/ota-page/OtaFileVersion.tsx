import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatOtaFileVersion } from "./index.js";

type OtaFileVersionProps = {
    version?: number | null;
};

const OtaFileVersion = memo(({ version }: OtaFileVersionProps) => {
    const { t } = useTranslation("ota");
    const versions = useMemo(() => formatOtaFileVersion(version), [version]);

    return versions === undefined ? (
        <span>N/A</span>
    ) : (
        <div className="flex flex-col">
            <span>
                {t(($) => $.app)}: {`${versions[0]} build ${versions[1]}`}
            </span>
            <span>
                {t(($) => $.stack)}: {`${versions[2]} build ${versions[3]}`}
            </span>
        </div>
    );
});

export default OtaFileVersion;
