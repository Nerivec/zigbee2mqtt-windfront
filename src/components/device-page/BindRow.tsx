import { faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Device, Group } from "../../types.js";
import { getEndpoints, isDevice } from "../../utils.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import Button from "../Button.js";
import ClusterMultiPicker from "../pickers/ClusterMultiPicker.js";
import DevicePicker from "../pickers/DevicePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import type { NiceBindingRule } from "./tabs/Bind.js";

interface BindRowProps extends Pick<AppState, "devices"> {
    rule: NiceBindingRule;
    groups: Group[];
    device: Device;
}

const getTarget = (rule: NiceBindingRule, devices: AppState["devices"], groups: Group[]): Device | Group | undefined => {
    const { target } = rule;

    return target.type === "group" ? groups.find((g) => g.id === target.id) : devices.find((device) => device.ieee_address === target.ieee_address);
};

type Action = "Bind" | "Unbind";

const BindRow = memo(({ devices, groups, device, rule }: BindRowProps) => {
    const [stateRule, setStateRule] = useState(rule);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["common", "zigbee"]);

    useEffect(() => {
        setStateRule(rule);
    }, [rule]);

    const onSourceEndpointChange = useCallback((endpoint: string | number): void => {
        setStateRule((prev) => ({ ...prev, source: { ...prev.source, endpoint } }));
    }, []);

    const onDestinationChange = useCallback((destination?: Device | Group): void => {
        if (!destination) {
            return;
        }

        const target = isDevice(destination)
            ? { type: "endpoint" as const, ieee_address: destination.ieee_address, endpoint: "" }
            : { type: "group" as const, id: destination.id };

        setStateRule((prev) => ({ ...prev, target, clusters: [] }));
    }, []);

    const onDestinationEndpointChange = useCallback(
        (endpoint: string): void => {
            if (stateRule.target.type === "endpoint") {
                setStateRule((prev) => ({ ...prev, target: { ...prev.target, endpoint }, clusters: [] }));
            }
        },
        [stateRule.target.type],
    );

    const onClustersChange = useCallback((clusters: string[]): void => {
        setStateRule((prev) => ({ ...prev, clusters }));
    }, []);

    const onBindOrUnBindClick = useCallback(
        async (action: Action): Promise<void> => {
            let to: string | number = "";
            let toEndpoint: string | number | undefined;
            const { target } = stateRule;

            if (target.type === "group") {
                const targetGroup = groups.find((group) => group.id === target.id);

                if (targetGroup) {
                    to = targetGroup.id;
                } else {
                    console.error("Target group does not exist:", target.id);
                    return;
                }
            } else if (target.type === "endpoint") {
                const targetDevice = devices.find((device) => device.ieee_address === target.ieee_address);

                if (targetDevice) {
                    to = targetDevice.ieee_address;

                    if (targetDevice.type !== "Coordinator") {
                        toEndpoint = target.endpoint;
                    }
                } else {
                    console.error("Target device does not exist:", target.ieee_address);
                    return;
                }
            }

            const bindParams = {
                from: device.ieee_address,
                from_endpoint: stateRule.source.endpoint,
                to,
                to_endpoint: toEndpoint,
                clusters: stateRule.clusters,
            };

            if (action === "Bind") {
                await sendMessage("bridge/request/device/bind", bindParams);
            } else {
                await sendMessage("bridge/request/device/unbind", bindParams);
            }
        },
        [device, stateRule, sendMessage, devices, groups],
    );

    const sourceEndpoints = useMemo(() => getEndpoints(device), [device]);
    const target = getTarget(stateRule, devices, groups);
    const destinationEndpoints = useMemo(() => getEndpoints(target), [target]);

    const possibleClusters = useMemo(() => {
        const clusters: Set<string> = new Set(stateRule.clusters);
        const srcEndpoint = device.endpoints[stateRule.source.endpoint];
        const dstEndpoint =
            stateRule.target.type === "endpoint" && stateRule.target.endpoint != null
                ? (target as Device | undefined)?.endpoints[stateRule.target.endpoint]
                : undefined;
        const allClustersValid = stateRule.target.type === "group" || (target as Device | undefined)?.type === "Coordinator";

        if (srcEndpoint && (dstEndpoint || allClustersValid)) {
            for (const cluster of [...srcEndpoint.clusters.input, ...srcEndpoint.clusters.output]) {
                if (allClustersValid) {
                    clusters.add(cluster);
                } else {
                    const supportedInputOutput = srcEndpoint.clusters.input.includes(cluster) && dstEndpoint?.clusters.output.includes(cluster);
                    const supportedOutputInput = srcEndpoint.clusters.output.includes(cluster) && dstEndpoint?.clusters.input.includes(cluster);

                    if (supportedInputOutput || supportedOutputInput || allClustersValid) {
                        clusters.add(cluster);
                    }
                }
            }
        }

        return clusters;
    }, [device.endpoints, stateRule, target]);

    const isValidRule = useMemo(() => {
        let valid = false;

        if (stateRule.target.type === "endpoint") {
            valid = !!(stateRule.source.endpoint && stateRule.target.ieee_address && stateRule.target.endpoint && stateRule.clusters.length > 0);
        } else if (stateRule.target.type === "group") {
            valid = !!(stateRule.source.endpoint && stateRule.target.id && stateRule.clusters.length > 0);
        }

        return valid;
    }, [stateRule]);

    return (
        <>
            <div className="flex flex-row flex-wrap gap-2">
                <EndpointPicker
                    label={t("source_endpoint")}
                    disabled={!stateRule.isNew}
                    values={sourceEndpoints}
                    value={stateRule.source.endpoint}
                    onChange={onSourceEndpointChange}
                />
                <DevicePicker
                    label={t("destination")}
                    disabled={!stateRule.isNew}
                    value={"ieee_address" in stateRule.target ? stateRule.target.ieee_address : stateRule.target.id}
                    devices={devices}
                    groups={groups}
                    onChange={onDestinationChange}
                />
                {stateRule.target.type === "endpoint" ? (
                    <EndpointPicker
                        label={t("destination_endpoint")}
                        disabled={!stateRule.isNew}
                        values={destinationEndpoints}
                        value={stateRule.target.endpoint}
                        onChange={onDestinationEndpointChange}
                    />
                ) : null}
                <div className="grow w-128">
                    <ClusterMultiPicker label={t("clusters")} clusters={possibleClusters} value={stateRule.clusters} onChange={onClustersChange} />
                </div>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{t("actions")}</legend>
                    <div className="join join-horizontal">
                        <Button<Action>
                            item={"Bind"}
                            disabled={!isValidRule}
                            title={t("bind")}
                            className="btn btn-primary join-item"
                            onClick={onBindOrUnBindClick}
                        >
                            <FontAwesomeIcon icon={faLink} />
                            {t("bind")}&nbsp;
                        </Button>
                        <Button<Action>
                            item={"Unbind"}
                            disabled={stateRule.isNew || !isValidRule}
                            title={t("unbind")}
                            className="btn btn-error join-item"
                            onClick={onBindOrUnBindClick}
                        >
                            <FontAwesomeIcon icon={faUnlink} />
                            &nbsp;{t("unbind")}
                        </Button>
                    </div>
                </fieldset>
            </div>
            <div className="divider" />
        </>
    );
});

export default BindRow;
