import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import frontendPackageJson from "../../../../package.json" with { type: "json" };
import {
    MQTT_SPEC_URL,
    NODEJS_RELEASE_URL,
    RELEASE_TAG_URL,
    Z2M_COMMIT_URL,
    Z2M_NEW_GITHUB_ISSUE_URL,
    Z2M_RELEASE_TAG_URL,
    ZH_RELEASE_TAG_URL,
    ZHC_RELEASE_TAG_URL,
} from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import Stats from "../Stats.js";

type ReportProblemLinkProps = { sourceIdx: number };

type AboutProps = { sourceIdx: number };

const ReportProblemLink = memo(({ sourceIdx }: ReportProblemLinkProps) => {
    const { t } = useTranslation("zigbee");
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const bridgeHealth = useAppStore(useShallow((state) => state.bridgeHealth[sourceIdx]));
    const githubUrlParams = {
        labels: "problem",
        title: "???",
        body: `<!-- MAKE SURE THIS IS NOT ALREADY POSTED ${Z2M_NEW_GITHUB_ISSUE_URL.slice(0, -4)} -->

### What happened?

### What did you expect to happen?

### How to reproduce it (minimal and precise)

### Debug logs

### Details
os: \`${bridgeInfo.os.version}\`
node: \`${bridgeInfo.os.node_version}\`
homeassistant: \`${bridgeInfo.config.homeassistant.enabled}\`
zigbee2mqtt: \`${bridgeInfo.version}\` (\`${bridgeInfo.commit}\`)
zigbee-herdsman: \`${bridgeInfo.zigbee_herdsman.version}\`
zigbee-herdsman-converters: \`${bridgeInfo.zigbee_herdsman_converters.version}\`
adapter: \`${bridgeInfo.coordinator.type}\` \`${JSON.stringify(bridgeInfo.coordinator.meta)}\``,
    };

    if (bridgeHealth.response_time > 0) {
        githubUrlParams.body += `
#### Last health check
time: \`${new Date(bridgeHealth.response_time)}\`
os.load_average: \`${bridgeHealth.os.load_average.join(", ")}\`
os.memory_percent: \`${bridgeHealth.os.memory_percent}\`
process.memory_percent: \`${bridgeHealth.process.memory_percent}\`
process.uptime_sec: \`${Math.round(bridgeHealth.process.uptime_sec)}\`
`;
    }

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            to={`${Z2M_NEW_GITHUB_ISSUE_URL}?${new URLSearchParams(githubUrlParams).toString()}`}
            className="btn btn-ghost"
        >
            {t("report_problem")}
        </Link>
    );
});

export default function About({ sourceIdx }: AboutProps) {
    const { t } = useTranslation("settings");
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const devices = useAppStore(useShallow((state) => state.devices[sourceIdx]));

    const isZigbee2mqttDevVersion = bridgeInfo.version.match(/^\d+\.\d+\.\d+$/) === null;
    const zigbee2mqttVersion = isZigbee2mqttDevVersion ? (
        <a className="link link-hover text-secondary" target="_blank" rel="noopener noreferrer" href={`${Z2M_COMMIT_URL}dev/`}>
            {bridgeInfo.version}
        </a>
    ) : (
        <a className="link link-hover" target="_blank" rel="noopener noreferrer" href={`${Z2M_RELEASE_TAG_URL}${bridgeInfo.version}`}>
            {bridgeInfo.version}
        </a>
    );
    const zigbee2mqttCommit = bridgeInfo.commit ? (
        <>
            commit:{" "}
            <a className="link" target="_blank" rel="noopener noreferrer" href={`${Z2M_COMMIT_URL}${bridgeInfo.commit}`}>
                {bridgeInfo.commit}
            </a>
        </>
    ) : null;
    const frontendVersion = (
        <a className="link link-hover" target="_blank" rel="noopener noreferrer" href={`${RELEASE_TAG_URL}${frontendPackageJson.version}`}>
            {frontendPackageJson.version}
        </a>
    );
    const zhcVersion = (
        <a
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
            href={`${ZHC_RELEASE_TAG_URL}${bridgeInfo.zigbee_herdsman_converters.version}`}
        >
            {bridgeInfo.zigbee_herdsman_converters.version}
        </a>
    );
    const zhVersion = (
        <a className="link link-hover" target="_blank" rel="noopener noreferrer" href={`${ZH_RELEASE_TAG_URL}${bridgeInfo.zigbee_herdsman.version}`}>
            {bridgeInfo.zigbee_herdsman.version}
        </a>
    );

    return (
        <div className="flex flex-col gap-3 items-center">
            <ReportProblemLink sourceIdx={sourceIdx} />
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
                        <a href={MQTT_SPEC_URL} target="_blank" rel="noreferrer" className="link link-hover">
                            {t("version")}: {bridgeInfo.mqtt.version}
                        </a>
                    </div>
                </div>
                <div className="stat place-items-center">
                    <div className="stat-title">{t("node_version")}</div>
                    <div className="stat-value text-lg">
                        <a href={NODEJS_RELEASE_URL} target="_blank" rel="noreferrer" className="link link-hover">
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
