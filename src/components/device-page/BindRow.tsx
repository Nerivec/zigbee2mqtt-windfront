import { faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Device, Group } from "../../types.js";
import { getEndpoints, isDevice } from "../../utils.js";
import Button from "../Button.js";
import type { Action, BindingRule } from "../binding/index.js";
import ConfirmButton from "../ConfirmButton.js";
import ClusterMultiPicker from "../pickers/ClusterMultiPicker.js";
import DevicePicker from "../pickers/DevicePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";

interface BindRowProps {
    sourceIdx: number;
    devices: AppState["devices"][number];
    rule: BindingRule;
    groups: Group[];
    device: Device;
    onApply(args: [Action, BindingRule]): Promise<void>;
    showDivider: boolean;
    hideUnbind?: boolean;
}

const BindRow = memo(({ devices, groups, device, rule, onApply, showDivider, hideUnbind = false }: BindRowProps) => {
    const [stateRule, setStateRule] = useState(rule);
    const { t } = useTranslation(["common", "zigbee"]);

    useEffect(() => {
        setStateRule(rule);
    }, [rule]);

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

    const target = useMemo(() => {
        const { target } = stateRule;

        return target.type === "group"
            ? groups.find((g) => g.id === target.id)
            : devices.find((device) => device.ieee_address === target.ieee_address);
    }, [stateRule, devices, groups]);
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
                <DevicePicker
                    label={t(($) => $.destination)}
                    disabled={!stateRule.isNew}
                    value={"ieee_address" in stateRule.target ? stateRule.target.ieee_address : stateRule.target.id}
                    devices={devices}
                    groups={groups}
                    onChange={onDestinationChange}
                    required
                />
                {stateRule.target.type === "endpoint" ? (
                    <EndpointPicker
                        label={t(($) => $.destination_endpoint)}
                        disabled={!stateRule.isNew}
                        values={destinationEndpoints}
                        value={stateRule.target.endpoint}
                        onChange={onDestinationEndpointChange}
                    />
                ) : (
                    <div className="w-32" />
                )}
                <div className="grow w-128">
                    <ClusterMultiPicker
                        label={t(($) => $.clusters)}
                        clusters={possibleClusters}
                        value={stateRule.clusters}
                        onChange={onClustersChange}
                    />
                </div>
                <fieldset className="fieldset ml-auto">
                    <legend className="fieldset-legend">{t(($) => $.actions)}</legend>
                    <div className="join join-horizontal">
                        <Button<[Action, BindingRule]>
                            item={["Bind", stateRule]}
                            disabled={!isValidRule}
                            title={t(($) => $.bind)}
                            className="btn btn-primary btn-outline join-item"
                            onClick={onApply}
                        >
                            <FontAwesomeIcon icon={faLink} />
                            {t(($) => $.bind)}&nbsp;
                        </Button>
                        {!hideUnbind && !stateRule.isNew ? (
                            <ConfirmButton<[Action, BindingRule]>
                                item={["Unbind", stateRule]}
                                disabled={stateRule.isNew || !isValidRule}
                                title={t(($) => $.unbind)}
                                className="btn btn-error btn-outline join-item"
                                onClick={onApply}
                                modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                            >
                                <FontAwesomeIcon icon={faUnlink} />
                                &nbsp;{t(($) => $.unbind)}
                            </ConfirmButton>
                        ) : null}
                    </div>
                </fieldset>
            </div>
            {showDivider ? <div className="divider my-0" /> : null}
        </>
    );
});

export default BindRow;
