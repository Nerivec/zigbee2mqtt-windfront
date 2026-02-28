import { faCheckCircle, faExclamationTriangle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import snakeCase from "lodash/snakeCase.js";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { InterviewState, SUPPORT_NEW_DEVICES_DOCS_URL, Z2M_NEW_GITHUB_ISSUE_URL } from "../../../consts.js";
import { OUI } from "../../../oui.js";
import { API_URLS, MULTI_INSTANCE, useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { toHex } from "../../../utils.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import DeviceControlEditName from "../../device/DeviceControlEditName.js";
import DeviceControlGroup from "../../device/DeviceControlGroup.js";
import DeviceControlUpdateDesc from "../../device/DeviceControlUpdateDesc.js";
import DeviceImage from "../../device/DeviceImage.js";
import { hasOtaCluster } from "../../device/index.js";
import { formatOtaFileVersion } from "../../ota-page/index.js";
import OtaControlGroup, { type OtaControlGroupProps } from "../../ota-page/OtaControlGroup.js";
import SourceDot from "../../SourceDot.js";
import Availability from "../../value-decorators/Availability.js";
import DisplayValue from "../../value-decorators/DisplayValue.js";
import LastSeen from "../../value-decorators/LastSeen.js";
import ModelLink from "../../value-decorators/ModelLink.js";
import PowerSource from "../../value-decorators/PowerSource.js";
import VendorLink from "../../value-decorators/VendorLink.js";

type LinkProps = {
    sourceIdx: number;
    device: Device;
};

type DeviceInfoProps = {
    sourceIdx: number;
    device: Device;
};

const MARKDOWN_LINK_REGEX = /\[(.*?)]\((.*?)\)/;

const SOURCE_BADGE_COLOR = {
    native: "badge-success",
    external: "badge-info",
    generated: "badge-warning",
};

const endpointsReplacer = (key: string, value: unknown) => {
    if (key === "bindings" || key === "configured_reportings" || key === "scenes") {
        return undefined;
    }

    return value;
};

const SubmitConverterLink = memo(({ sourceIdx, device }: LinkProps) => {
    const { t } = useTranslation("zigbee");
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const githubUrlParams = {
        template: "external_converter.yaml",
        title: `[External Converter]: ${device.model_id} from ${device.manufacturer}`,
        z2m_version: `${bridgeInfo.version} (${bridgeInfo.commit})`,
        notes: `
software_build_id: \`${device.software_build_id}\`
date_code: \`${device.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(device.endpoints, endpointsReplacer)}
\`\`\``,
    };

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            to={`${Z2M_NEW_GITHUB_ISSUE_URL}?${new URLSearchParams(githubUrlParams).toString()}`}
            className="link link-hover"
        >
            {t(($) => $.submit_converter)}
        </Link>
    );
});

const ReportProblemLink = memo(({ sourceIdx, device }: LinkProps) => {
    const { t } = useTranslation("zigbee");
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const bridgeHealth = useAppStore(useShallow((state) => state.bridgeHealth[sourceIdx]));
    const githubUrlParams = {
        template: "problem_report.yaml",
        title: `[${device.model_id} / ${device.manufacturer}] ???`,
        z2m_version: `${bridgeInfo.version} (${bridgeInfo.commit})`,
        adapter_fwversion: JSON.stringify(bridgeInfo.coordinator.meta),
        adapter: bridgeInfo.coordinator.type,
        setup: `os: \`${bridgeInfo.os.version}\`
node: \`${bridgeInfo.os.node_version}\`
ha: \`${bridgeInfo.config.homeassistant.enabled}\``,
        notes: `
#### Device
software_build_id: \`${device.software_build_id}\`
date_code: \`${device.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(device.endpoints)}
\`\`\``,
    };

    if (bridgeHealth.response_time > 0) {
        githubUrlParams.notes += `
##### Health
time: \`${new Date(bridgeHealth.response_time)}\`
os.load_average: \`${bridgeHealth.os.load_average.join(", ")}\`
os.memory_percent: \`${bridgeHealth.os.memory_percent}\`
process.memory_percent: \`${bridgeHealth.process.memory_percent}\`
process.uptime_sec: \`${Math.round(bridgeHealth.process.uptime_sec)}\`
\`\`\`json
${JSON.stringify(bridgeHealth.devices[device.ieee_address] ?? {})}
\`\`\`
`;
    }

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            to={`${Z2M_NEW_GITHUB_ISSUE_URL}?${new URLSearchParams(githubUrlParams).toString()}`}
            className="btn btn-ghost"
        >
            {t(($) => $.report_problem)}
        </Link>
    );
});

export default function DeviceInfo({ sourceIdx, device }: DeviceInfoProps) {
    const { t } = useTranslation(["zigbee", "availability", "common", "ota"]);
    const deviceStates = useAppStore(useShallow((state) => state.deviceStates[sourceIdx]));
    const bridgeConfig = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].config));
    const availability = useAppStore(useShallow((state) => state.availability[sourceIdx]));
    const recentActivity = useAppStore(useShallow((state) => state.recentActivity[sourceIdx]));
    const homeassistantEnabled = bridgeConfig.homeassistant.enabled;
    const deviceState = deviceStates[device.friendly_name] ?? {};
    const deviceRecentActivity = recentActivity[device.friendly_name];

    const canOta = useMemo(() => hasOtaCluster(device), [device]);
    const otaInstalledVersion = useMemo(() => formatOtaFileVersion(deviceState.update?.installed_version), [deviceState.update?.installed_version]);
    const oui = useMemo(() => OUI.get(device.ieee_address.slice(2, 8)) ?? "?", [device.ieee_address]);

    const setDeviceDescription = useCallback(
        async (id: string, description: string): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/options", { id, options: { description } });
        },
        [sourceIdx],
    );
    const renameDevice = useCallback(async (source: number, from: string, to: string, homeassistantRename: boolean): Promise<void> => {
        await sendMessage(source, "bridge/request/device/rename", {
            from,
            to,
            homeassistant_rename: homeassistantRename,
            last: undefined,
        });
    }, []);
    const configureDevice = useCallback(async ([source, id]: [number, string]): Promise<void> => {
        await sendMessage(source, "bridge/request/device/configure", { id });
    }, []);
    const interviewDevice = useCallback(async ([source, id]: [number, string]): Promise<void> => {
        await sendMessage(source, "bridge/request/device/interview", { id });
    }, []);
    const removeDevice = useCallback(async (source: number, id: string, force: boolean, block: boolean): Promise<void> => {
        await sendMessage(source, "bridge/request/device/remove", { id, force, block });
    }, []);

    const onOtaCheckClick: OtaControlGroupProps["onCheckClick"] = useCallback(
        async ({ sourceIdx, ieee, ...rest }) => await sendMessage(sourceIdx, "bridge/request/device/ota_update/check", { id: ieee, ...rest }),
        [],
    );

    const onOtaUpdateClick: OtaControlGroupProps["onUpdateClick"] = useCallback(
        async ({ sourceIdx, ieee, downgrade, ...rest }) =>
            await sendMessage(
                sourceIdx,
                downgrade ? "bridge/request/device/ota_update/update/downgrade" : "bridge/request/device/ota_update/update",
                {
                    id: ieee,
                    ...rest,
                },
            ),
        [],
    );

    const onOtaScheduleClick: OtaControlGroupProps["onScheduleClick"] = useCallback(
        async ({ sourceIdx, ieee, downgrade, ...rest }) =>
            await sendMessage(
                sourceIdx,
                downgrade ? "bridge/request/device/ota_update/schedule/downgrade" : "bridge/request/device/ota_update/schedule",
                { id: ieee, ...rest },
            ),
        [],
    );

    const onOtaUnscheduleClick: OtaControlGroupProps["onUnscheduleClick"] = useCallback(
        async ({ sourceIdx, ieee }) => await sendMessage(sourceIdx, "bridge/request/device/ota_update/unschedule", { id: ieee }),
        [],
    );

    const deviceAvailability = bridgeConfig.devices[device.ieee_address]?.availability;
    const definitionDescription = useMemo(() => {
        const result = device.definition?.description ? MARKDOWN_LINK_REGEX.exec(device.definition?.description) : undefined;

        if (result) {
            const [, title, link] = result;

            return (
                <Link target="_blank" rel="noopener noreferrer" to={link} className="link link-hover">
                    {title}
                </Link>
            );
        }

        return <>{device.definition?.description}</>;
    }, [device.definition]);

    const deviceInterviewState = useMemo(() => {
        switch (device.interview_state) {
            case InterviewState.Pending: {
                return <FontAwesomeIcon icon={faSpinner} className="text-info" />;
            }
            case InterviewState.InProgress: {
                return <FontAwesomeIcon icon={faSpinner} spin className="text-info" />;
            }
            case InterviewState.Successful: {
                return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
            }
            default: {
                return <FontAwesomeIcon icon={faExclamationTriangle} beat className="text-error" />;
            }
        }
    }, [device.interview_state]);

    return (
        <div className="card lg:card-side bg-base-100">
            <figure className="w-64 h-64" style={{ overflow: "visible" }}>
                <DeviceImage device={device} otaState={deviceState.update?.state} disabled={device.disabled} />
            </figure>
            <div className="card-body">
                <h2 className="card-title">
                    {device.friendly_name}
                    <DeviceControlEditName
                        sourceIdx={sourceIdx}
                        name={device.friendly_name}
                        renameDevice={renameDevice}
                        homeassistantEnabled={homeassistantEnabled}
                        style="btn-link btn-sm btn-square"
                    />
                </h2>
                <div className="flex flex-row flex-wrap gap-2">
                    <span className={`badge ${device.definition ? SOURCE_BADGE_COLOR[device.definition.source] : ""}`}>
                        <DisplayValue name="supported" value={device.supported} />
                        {device.definition ? `: ${device.definition.source}` : ""}
                    </span>
                    {!device.supported && (
                        <span className="badge animate-bounce">
                            <Link target="_blank" rel="noopener noreferrer" to={SUPPORT_NEW_DEVICES_DOCS_URL} className="link link-hover">
                                {t(($) => $.how_to_add_support)}
                            </Link>
                        </span>
                    )}
                    {device.definition?.source === "external" && (
                        <span className="badge animate-bounce">
                            <SubmitConverterLink sourceIdx={sourceIdx} device={device} />
                        </span>
                    )}
                    <span className="badge opacity-70 tooltip tooltip-bottom" data-tip={device.interview_state}>
                        {t(($) => $.interview_state)}: {deviceInterviewState}
                    </span>
                </div>
                <div>
                    <pre className="inline text-wrap break-all">{device.description || ""}</pre>
                    <DeviceControlUpdateDesc device={device} setDeviceDescription={setDeviceDescription} />
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat px-3">
                        <div className="stat-title">{device.type}</div>
                        <div className="stat-value text-xl tooltip tooltip-bottom" data-tip={t(($) => $.ieee_address)}>
                            {device.ieee_address}
                        </div>
                        <div className="stat-desc tooltip tooltip-top" data-tip="Organizationally Unique Identifier / IEEE Vendor Prefix">
                            OUI: {oui}
                        </div>
                    </div>
                    <div className="stat px-3">
                        <div className="stat-title">{t(($) => $.network_address)}</div>
                        <div className="stat-value text-xl tooltip tooltip-bottom" data-tip={t(($) => $.network_address_hex)}>
                            {toHex(device.network_address)}
                        </div>
                        <div className="stat-desc">
                            {t(($) => $.network_address_dec)}: {device.network_address}
                        </div>
                    </div>
                    <div className="stat px-3">
                        <div className="stat-title">{t(($) => $.power)}</div>
                        <div className="stat-value text-xl">
                            <PowerSource
                                showLevel={true}
                                device={device}
                                batteryPercent={deviceState.battery as number}
                                batteryState={deviceState.battery_state as string}
                                batteryLow={deviceState.battery_low as boolean}
                            />
                        </div>
                        <div className="stat-desc">
                            {device.type === "GreenPower" ? "GreenPower" : t(($) => $[snakeCase(device.power_source)] || $.unknown)}
                        </div>
                    </div>
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat px-3">
                        <div className="stat-title">{t(($) => $.zigbee_model)}</div>
                        <div className="stat-value text-xl">{device.model_id}</div>
                        <div className="stat-desc">
                            {device.manufacturer} ({definitionDescription})
                        </div>
                    </div>
                    <div className="stat px-3">
                        <div className="stat-title">{t(($) => $.model)}</div>
                        <div className="stat-value text-xl">
                            <ModelLink device={device} />
                        </div>
                        <div className="stat-desc">
                            <VendorLink device={device} />
                        </div>
                    </div>
                    {device.software_build_id ? (
                        <div className="stat px-3">
                            <div className="stat-title">{t(($) => $.firmware_id)}</div>
                            <div className="stat-value text-xl">{device.software_build_id || "N/A"}</div>
                            <div className="stat-desc">{device.date_code || "N/A"}</div>
                        </div>
                    ) : null}
                    {canOta ? (
                        <div className="stat px-3">
                            <div className="stat-title">{t(($) => $.firmware_version, { ns: "ota" })}</div>
                            <div className="stat-value text-xl">
                                {deviceState.update?.installed_version ?? t(($) => $.unknown)}
                                <span className="ms-3">
                                    <OtaControlGroup
                                        sourceIdx={sourceIdx}
                                        device={device}
                                        otaSettings={bridgeConfig.ota}
                                        state={deviceState.update}
                                        onCheckClick={onOtaCheckClick}
                                        onUpdateClick={onOtaUpdateClick}
                                        onScheduleClick={onOtaScheduleClick}
                                        onUnscheduleClick={onOtaUnscheduleClick}
                                    />
                                </span>
                            </div>
                            {otaInstalledVersion ? (
                                <div className="stat-desc">
                                    {t(($) => $.app, { ns: "ota" })}: {`${otaInstalledVersion[0]} build ${otaInstalledVersion[1]}`}
                                    {" | "}
                                    {t(($) => $.stack, { ns: "ota" })}: {`${otaInstalledVersion[2]} build ${otaInstalledVersion[3]}`}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat px-3">
                        <div className="stat-title">{t(($) => $.last_seen)}</div>
                        <div className="stat-value text-xl">
                            <LastSeen
                                config={bridgeConfig.advanced.last_seen}
                                lastSeen={deviceState.last_seen}
                                fallback={t(($) => $.disabled, { ns: "common" })}
                            />
                        </div>
                        <div className="stat-desc">
                            {t(($) => $.availability, { ns: "availability" })}
                            {": "}
                            <Availability
                                availability={availability[device.friendly_name]?.state ?? "offline"}
                                disabled={device.disabled}
                                availabilityFeatureEnabled={bridgeConfig.availability.enabled}
                                availabilityEnabledForDevice={deviceAvailability != null ? !!deviceAvailability : undefined}
                            />
                        </div>
                    </div>
                    {deviceRecentActivity && (
                        <div className="stat px-3 min-w-0">
                            <div className="stat-title">{t(($) => $.recent_activity, { ns: "common" })}</div>
                            <div className="stat-value text-xl truncate">
                                <SourceDot idx={sourceIdx} autoHide />
                                {deviceRecentActivity.desc}
                            </div>
                            <div className="stat-desc">{new Date(deviceRecentActivity.timestamp).toLocaleString()}</div>
                        </div>
                    )}
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat px-3">
                        <div className="stat-title">MQTT</div>
                        <div className="stat-value text-xl">
                            {bridgeConfig.mqtt.base_topic}/{device.friendly_name}
                        </div>
                        <div className="stat-desc text-base-content/0">-</div>
                    </div>
                    {MULTI_INSTANCE && (
                        <div className="stat px-3">
                            <div className="stat-title">{t(($) => $.source, { ns: "common" })}</div>
                            <div className="stat-value text-xl">
                                <SourceDot idx={sourceIdx} alwaysShowName />
                            </div>
                            <div className="stat-desc">{API_URLS[sourceIdx]}</div>
                        </div>
                    )}
                </div>
                <div className="card-actions justify-end mt-2">
                    <ReportProblemLink sourceIdx={sourceIdx} device={device} />
                    <DeviceControlGroup
                        sourceIdx={sourceIdx}
                        device={device}
                        otaState={deviceState.update?.state}
                        homeassistantEnabled={homeassistantEnabled}
                        renameDevice={renameDevice}
                        configureDevice={configureDevice}
                        interviewDevice={interviewDevice}
                        removeDevice={removeDevice}
                    />
                </div>
            </div>
        </div>
    );
}
