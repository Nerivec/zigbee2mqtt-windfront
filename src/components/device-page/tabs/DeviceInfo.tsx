import { faCheckCircle, faExclamationTriangle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import snakeCase from "lodash/snakeCase.js";
import { memo, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { InterviewState, SUPPORT_NEW_DEVICES_DOCS_URL, Z2M_NEW_GITHUB_ISSUE_URL, ZHC_NEW_GITHUB_ISSUE_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { toHex } from "../../../utils.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import DeviceControlEditName from "../../device/DeviceControlEditName.js";
import DeviceControlGroup from "../../device/DeviceControlGroup.js";
import DeviceControlUpdateDesc from "../../device/DeviceControlUpdateDesc.js";
import DeviceImage from "../../device/DeviceImage.js";
import Availability from "../../value-decorators/Availability.js";
import DisplayValue from "../../value-decorators/DisplayValue.js";
import LastSeen from "../../value-decorators/LastSeen.js";
import ModelLink from "../../value-decorators/ModelLink.js";
import PowerSource from "../../value-decorators/PowerSource.js";
import VendorLink from "../../value-decorators/VendorLink.js";

type ReportProblemLinkProps = {
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

const SubmitConverterLink = memo(({ device }: { device: Device }) => {
    const { t } = useTranslation("zigbee");
    const githubUrlParams = {
        labels: "enhancement",
        title: `[External Converter] ${device.model_id} from ${device.manufacturer}`,
        body: `<!-- MAKE SURE THIS IS NOT ALREADY POSTED ${ZHC_NEW_GITHUB_ISSUE_URL.slice(0, -4)} -->

This is my external converter for \`${device.model_id}\` from \`${device.manufacturer}\`
software_build_id: \`${device.software_build_id}\`
date_code: \`${device.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(device.endpoints, endpointsReplacer)}
\`\`\`

### What works / what doesn't?

### Converter

\`\`\`js
<!-- REPLACE THIS LINE WITH YOUR EXTERNAL CONVERTER'S CODE -->
\`\`\`
`,
    };

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            to={`${ZHC_NEW_GITHUB_ISSUE_URL}?${new URLSearchParams(githubUrlParams).toString()}`}
            className="link link-hover"
        >
            {t("submit_converter")}
        </Link>
    );
});

const ReportProblemLink = memo(({ sourceIdx, device }: ReportProblemLinkProps) => {
    const { t } = useTranslation("zigbee");
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const bridgeHealth = useAppStore(useShallow((state) => state.bridgeHealth[sourceIdx]));
    const githubUrlParams = {
        labels: "problem",
        title: `[${device.model_id} / ${device.manufacturer}] ???`,
        body: `<!-- MAKE SURE THIS IS NOT ALREADY POSTED ${Z2M_NEW_GITHUB_ISSUE_URL.slice(0, -4)} -->

### What happened?

### What did you expect to happen?

### How to reproduce it (minimal and precise)

### Debug logs

### Details
os: \`${bridgeInfo.os.version}\`
node: \`${bridgeInfo.os.node_version}\`
zigbee2mqtt: \`${bridgeInfo.version}\` (\`${bridgeInfo.commit}\`)
zigbee-herdsman: \`${bridgeInfo.zigbee_herdsman.version}\`
zigbee-herdsman-converters: \`${bridgeInfo.zigbee_herdsman_converters.version}\`
adapter: \`${bridgeInfo.coordinator.type}\` \`${JSON.stringify(bridgeInfo.coordinator.meta)}\`
#### Device
software_build_id: \`${device.software_build_id}\`
date_code: \`${device.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(device.endpoints)}
\`\`\``,
    };

    if (bridgeHealth.response_time > 0) {
        githubUrlParams.body += `
##### Health
time: \`${new Date(bridgeHealth.response_time)}\`
process.uptime_sec: \`${bridgeHealth.process.uptime_sec}\`
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
            {t("report_problem")}
        </Link>
    );
});

export default function DeviceInfo({ sourceIdx, device }: DeviceInfoProps) {
    const { t } = useTranslation(["zigbee", "availability"]);
    const deviceStates = useAppStore(useShallow((state) => state.deviceStates[sourceIdx]));
    const bridgeConfig = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].config));
    const availability = useAppStore(useShallow((state) => state.availability[sourceIdx]));
    const homeassistantEnabled = bridgeConfig.homeassistant.enabled;
    const deviceState = useMemo(() => deviceStates[device.friendly_name] ?? {}, [device.friendly_name, deviceStates]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const setDeviceDescription = useCallback(
        async (id: string, description: string): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/options", { id, options: { description } });
        },
        [sourceIdx, sendMessage],
    );
    const renameDevice = useCallback(
        async (source: number, from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage(source, "bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: undefined,
            });
        },
        [sendMessage],
    );
    const configureDevice = useCallback(
        async ([source, id]: [number, string]): Promise<void> => {
            await sendMessage(source, "bridge/request/device/configure", { id });
        },
        [sendMessage],
    );
    const interviewDevice = useCallback(
        async ([source, id]: [number, string]): Promise<void> => {
            await sendMessage(source, "bridge/request/device/interview", { id });
        },
        [sendMessage],
    );
    const removeDevice = useCallback(
        async (source: number, id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage(source, "bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
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
                <DeviceImage device={device} otaState={deviceState.update?.state} disabled={device.disabled} className="" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">
                    {device.friendly_name} ({device.ieee_address})
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
                                {t("how_to_add_support")}
                            </Link>
                        </span>
                    )}
                    {device.definition?.source === "external" && (
                        <span className="badge animate-bounce">
                            <SubmitConverterLink device={device} />
                        </span>
                    )}
                    <span className="badge opacity-70" title={device.interview_state}>
                        {t("interview_state")}: {deviceInterviewState}
                    </span>
                </div>
                <div>
                    <pre className="inline">{device.description || ""}</pre>
                    <DeviceControlUpdateDesc device={device} setDeviceDescription={setDeviceDescription} />
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                        <div className="stat-title">{device.type}</div>
                        <div className="stat-value text-xl">{toHex(device.network_address)}</div>
                        <div className="stat-desc">
                            {t("network_address_dec")}: {device.network_address}
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">{t("last_seen")}</div>
                        <div className="stat-value text-xl">
                            <LastSeen config={bridgeConfig.advanced.last_seen} lastSeen={deviceState.last_seen} />
                        </div>
                        <div className="stat-desc">
                            {t("availability:availability")}
                            {": "}
                            <Availability
                                availability={availability[device.friendly_name] ?? { state: "offline" }}
                                disabled={device.disabled}
                                availabilityFeatureEnabled={bridgeConfig.availability.enabled}
                                availabilityEnabledForDevice={deviceAvailability != null ? !!deviceAvailability : undefined}
                            />
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">{t("power")}</div>
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
                            {device.type === "GreenPower" ? "GreenPower" : t(snakeCase(device.power_source) || "unknown")}
                        </div>
                    </div>
                    {
                        <div className="stat">
                            <div className="stat-title">{t("firmware_id")}</div>
                            <div className="stat-value text-xl">{device.software_build_id || t("unknown")}</div>
                            <div className="stat-desc">{device.date_code || t("unknown")}</div>
                        </div>
                    }
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                        <div className="stat-title">{t("zigbee_model")}</div>
                        <div className="stat-value text-xl">{device.model_id}</div>
                        <div className="stat-desc">
                            {device.manufacturer} ({definitionDescription})
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">{t("model")}</div>
                        <div className="stat-value text-xl">
                            <ModelLink device={device} />
                        </div>
                        <div className="stat-desc">
                            <VendorLink device={device} />
                        </div>
                    </div>
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
