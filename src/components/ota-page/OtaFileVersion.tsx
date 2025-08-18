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
        <div className="join join-vertical">
            <span className="badge badge-sm badge-soft badge-ghost cursor-default join-item w-full">
                {t("app")}: {`${versions[0]} build ${versions[1]}`}
            </span>
            <span className="badge badge-sm badge-soft badge-ghost cursor-default join-item w-full">
                {t("stack")}: {`${versions[2]} build ${versions[3]}`}
            </span>
        </div>
    );
});

export default OtaFileVersion;
