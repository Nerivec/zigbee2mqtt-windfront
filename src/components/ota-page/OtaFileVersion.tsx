import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

type OtaFileVersionProps = {
    version?: number | null;
};

const OtaFileVersion = memo((props: OtaFileVersionProps) => {
    const { t } = useTranslation("ota");
    const versions = useMemo(() => {
        if (props.version == null || props.version < 0) {
            return undefined;
        }

        const versionString = props.version.toString(16).padStart(8, "0");
        const appRelease = `${versionString[0]}.${versionString[1]}`;
        const appBuild = versionString.slice(2, 4);
        const stackRelease = `${versionString[4]}.${versionString[5]}`;
        const stackBuild = versionString.slice(6);

        return [appRelease, appBuild, stackRelease, stackBuild];
    }, [props.version]);

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
