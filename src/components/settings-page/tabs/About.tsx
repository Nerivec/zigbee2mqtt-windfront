import { useTranslation } from "react-i18next";
import frontendPackageJson from "../../../../package.json" with { type: "json" };
import { useAppSelector } from "../../../hooks/useApp.js";
import Stats from "../Stats.js";

export default function About() {
    const { t } = useTranslation("settings");
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const devices = useAppSelector((state) => state.devices);

    const isZigbee2mqttDevVersion = bridgeInfo.version.match(/^\d+\.\d+\.\d+$/) === null;
    const zigbee2mqttVersion = isZigbee2mqttDevVersion ? (
        <a
            className="link link-hover text-secondary"
            target="_blank"
            rel="noopener noreferrer"
            href={"https://github.com/Koenkk/zigbee2mqtt/commits/dev/"}
        >
            {bridgeInfo.version}
        </a>
    ) : (
        <a
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/Koenkk/zigbee2mqtt/releases/tag/${bridgeInfo.version}`}
        >
            {bridgeInfo.version}
        </a>
    );
    const zigbee2mqttCommit = bridgeInfo.commit ? (
        <>
            commit:{" "}
            <a className="link" target="_blank" rel="noopener noreferrer" href={`https://github.com/Koenkk/zigbee2mqtt/commit/${bridgeInfo.commit}`}>
                {bridgeInfo.commit}
            </a>
        </>
    ) : null;
    const frontendVersion = (
        <a
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/Nerivec/zigbee2mqtt-windfront/releases/tag/${frontendPackageJson.version}`}
        >
            {frontendPackageJson.version}
        </a>
    );
    const zhcVersion = (
        <a
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/Koenkk/zigbee-herdsman-converters/releases/tag/v${bridgeInfo.zigbee_herdsman_converters.version}`}
        >
            {bridgeInfo.zigbee_herdsman_converters.version}
        </a>
    );
    const zhVersion = (
        <a
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/Koenkk/zigbee-herdsman/releases/tag/v${bridgeInfo.zigbee_herdsman.version}`}
        >
            {bridgeInfo.zigbee_herdsman.version}
        </a>
    );

    return (
        <div className="flex flex-col gap-3 items-center">
            <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat place-items-center">
                    <div className="stat-title">{t("zigbee2mqtt_version")}</div>
                    <div className="stat-value text-lg">{zigbee2mqttVersion}</div>
                    <div className="stat-desc">{zigbee2mqttCommit}</div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">{t("frontend_version")}</div>
                    <div className="stat-value text-lg">{frontendVersion}</div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">{t("zigbee_herdsman_converters_version")}</div>
                    <div className="stat-value text-lg">{zhcVersion}</div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">{t("zigbee_herdsman_version")}</div>
                    <div className="stat-value text-lg">{zhVersion}</div>
                </div>
            </div>
            <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat place-items-center">
                    <div className="stat-title">{t("machine")}</div>
                    <div className="stat-value text-lg">{bridgeInfo.os.version}</div>
                    <div className="stat-desc">CPU: {bridgeInfo.os.cpus}</div>
                    <div className="stat-desc">RAM: {bridgeInfo.os.memory_mb} MB</div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">{t("mqtt")}</div>
                    <div className="stat-value text-lg">{bridgeInfo.mqtt.server}</div>
                    <div className="stat-desc">
                        <a href="https://mqtt.org/mqtt-specification/" target="_blank" rel="noreferrer" className="link link-hover">
                            {t("version")}: {bridgeInfo.mqtt.version}
                        </a>
                    </div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">{t("node_version")}</div>
                    <div className="stat-value text-lg">
                        <a href="https://nodejs.org/en/about/previous-releases" target="_blank" rel="noreferrer" className="link link-hover">
                            {bridgeInfo.os.node_version}
                        </a>
                    </div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">{t("coordinator")}</div>
                    <div className="stat-value text-lg">{bridgeInfo.coordinator.type}</div>
                    <div className="stat-desc">
                        <span className="badge badge-sm badge-primary" title={t("coordinator_ieee_address")}>
                            {bridgeInfo.coordinator.ieee_address}
                        </span>
                    </div>
                    <div className="stat-desc">
                        {t("revision")}: {bridgeInfo.coordinator.meta.revision || t("zigbee:unknown")}
                    </div>
                </div>
            </div>
            <ul className="menu bg-base-100 rounded-box shadow min-w-sm">
                <li>
                    <details open>
                        <summary>{t("stats")}</summary>
                        <Stats devices={devices} />
                    </details>
                </li>
            </ul>
        </div>
    );
}
