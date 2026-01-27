import { faQuestion, faReply } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store.js";
import type { CommandDefinition, Device, LogMessage } from "../../types.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import InputField from "../form-fields/InputField.js";
import TextareaField from "../form-fields/TextareaField.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import CommandPicker from "../pickers/CommandPicker.js";
import type { ClusterGroup } from "../pickers/index.js";
import { MergedDataType } from "./index.js";
import LastLogResult from "./LastLogResult.js";

interface CommandExecutorProps {
    sourceIdx: number;
    device: Device;
    lastLog: LogMessage | undefined;
}

const getConditionStr = (conditions: CommandDefinition["parameters"][number]["conditions"]): string | undefined => {
    if (conditions) {
        let str = "[";

        for (const condition of conditions) {
            str += `{${condition.type}`;

            for (const key in condition) {
                if (key === "type") {
                    continue;
                }

                str += ` ${key}=${condition[key as keyof typeof condition]}`;
            }

            str += "}";
        }

        return `${str}]`;
    }
};

const CommandExecutor = memo(({ sourceIdx, device, lastLog }: CommandExecutorProps) => {
    const { t } = useTranslation(["common", "zigbee"]);
    const [endpoint, setEndpoint] = useState<number>(1);
    const [cluster, setCluster] = useState<string>("");
    const [command, setCommand] = useState<string>("");
    const [commandDefinition, setCommandDefinition] = useState<CommandDefinition | null>(null);
    const [payload, setPayload] = useState("{}");
    const bridgeDefinitions = useAppStore(useShallow((state) => state.bridgeDefinitions[sourceIdx]));

    const canExecute = useMemo(() => {
        if (!cluster || !command) {
            return false;
        }

        try {
            const parsedPayload = JSON.parse(payload);

            if (typeof parsedPayload !== "object") {
                return false;
            }

            if (Array.isArray(parsedPayload) && parsedPayload.length > 0 && typeof parsedPayload[0] !== "object") {
                return false;
            }
        } catch {
            return false;
        }

        return true;
    }, [payload, cluster, command]);

    const clusters = useMemo((): ClusterGroup[] => {
        const deviceEndpoint = device.endpoints[endpoint];
        const uniqueClusters = new Set<string>();
        const deviceInputs = new Set<string>();
        const deviceOutputs = new Set<string>();
        const deviceCustoms = new Set<string>();
        const otherZcls = new Set<string>();

        const customClusters = bridgeDefinitions.custom_clusters[device.ieee_address];

        if (customClusters) {
            for (const key in bridgeDefinitions.custom_clusters[device.ieee_address]) {
                if (!uniqueClusters.has(key)) {
                    uniqueClusters.add(key);
                    deviceCustoms.add(key);
                }
            }
        }

        if (deviceEndpoint) {
            for (const inCluster of deviceEndpoint.clusters.input) {
                if (!uniqueClusters.has(inCluster)) {
                    uniqueClusters.add(inCluster);
                    deviceInputs.add(inCluster);
                }
            }

            for (const outCluster of deviceEndpoint.clusters.output) {
                if (!uniqueClusters.has(outCluster)) {
                    uniqueClusters.add(outCluster);
                    deviceOutputs.add(outCluster);
                }
            }
        }

        for (const key in bridgeDefinitions.clusters) {
            if (!uniqueClusters.has(key)) {
                otherZcls.add(key);
            }
        }

        return [
            {
                name: "custom_clusters",
                clusters: deviceCustoms,
            },
            {
                name: "input_clusters",
                clusters: deviceInputs,
            },
            {
                name: "output_clusters",
                clusters: deviceOutputs,
            },
            {
                name: "other_zcl_clusters",
                clusters: otherZcls,
            },
        ];
    }, [device.ieee_address, device.endpoints, endpoint, bridgeDefinitions]);

    const onCommandChange = useCallback((cmd: string, definition: CommandDefinition): void => {
        setCommand(cmd);
        setCommandDefinition(definition);

        let newPayload = "{\n";
        const lastParam = definition.parameters.length - 1;

        for (let i = 0; i < definition.parameters.length; i++) {
            const param = definition.parameters[i];

            newPayload += `    "${param.name}": TODO${i === lastParam ? "" : ","}\n`;
        }

        newPayload += "}";

        setPayload(newPayload);
    }, []);

    const onExecute = useCallback(async () => {
        let commandKey: string | number = Number.parseInt(command, 10);

        if (Number.isNaN(commandKey)) {
            commandKey = command;
        }

        await sendMessage(
            sourceIdx,
            // @ts-expect-error templated API endpoint
            `${device.ieee_address}/${endpoint}/set`,
            {
                command: { cluster, command: commandKey, payload: JSON.parse(payload) },
            },
        );
    }, [sourceIdx, cluster, device.ieee_address, command, payload, endpoint]);

    return (
        <div className="flex-1 flex flex-col gap-3 w-full">
            <h2 className="text-lg">{t(($) => $.execute_command)}</h2>
            <div className="flex flex-row flex-wrap gap-2">
                <InputField
                    type="number"
                    name="endpoint"
                    label={t(($) => $.endpoint, { ns: "zigbee" })}
                    min={1}
                    max={255}
                    value={endpoint}
                    onChange={(e) => !!e.target.value && setEndpoint(e.target.valueAsNumber)}
                    required
                />
                <ClusterSinglePicker
                    label={t(($) => $.cluster, { ns: "zigbee" })}
                    clusters={clusters}
                    value={cluster}
                    onChange={(cluster) => {
                        setCluster(cluster);
                    }}
                    required
                />
                <CommandPicker
                    sourceIdx={sourceIdx}
                    label={t(($) => $.command)}
                    value={command}
                    cluster={cluster}
                    device={device}
                    onChange={onCommandChange}
                />
            </div>
            {commandDefinition ? (
                <div className="list">
                    {commandDefinition.required && commandDefinition.response == null ? null : (
                        <div className="list-row p-1">
                            <div className="flex flex-row gap-2">
                                {commandDefinition.required ? null : (
                                    <span className={"tooltip tooltip-right"} data-tip={t(($) => $.command_not_required, { ns: "zigbee" })}>
                                        <FontAwesomeIcon icon={faQuestion} className="text-warning" />
                                    </span>
                                )}
                                {commandDefinition.response == null ? null : (
                                    <span className={"tooltip tooltip-right"} data-tip={t(($) => $.command_has_response, { ns: "zigbee" })}>
                                        <FontAwesomeIcon icon={faReply} className="text-accent" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {commandDefinition.parameters.length > 0 ? (
                        commandDefinition.parameters.map((param) => (
                            <div key={param.name} className="list-row p-1">
                                <div>
                                    {param.name}: {MergedDataType[param.type]}
                                </div>
                                <div className="flex flex-row gap-2 justify-end">
                                    {param.min != null ? <span>Min: {param.min}</span> : null}
                                    {param.minExcl != null ? <span>Min excl: {param.minExcl}</span> : null}
                                    {param.max != null ? <span>Max: {param.max}</span> : null}
                                    {param.maxExcl != null ? <span>Max excl: {param.maxExcl}</span> : null}
                                    {param.minLen != null ? <span>Min len: {param.minLen}</span> : null}
                                    {param.maxLen != null ? <span>Max len: {param.maxLen}</span> : null}
                                    {param.length != null ? <span>Length: {param.length}</span> : null}
                                    {param.special != null ? (
                                        <span>Special: [{param.special.map((sp) => `${sp[0]}=${sp[1]}`).join(" ")}]</span>
                                    ) : null}
                                    {param.conditions != null ? <span>Conditions: {getConditionStr(param.conditions)}</span> : null}
                                </div>
                            </div>
                        ))
                    ) : (
                        <>NO PARAMETER</>
                    )}
                </div>
            ) : null}
            <TextareaField
                name="payload"
                label={t(($) => $.payload)}
                rows={(payload.match(/\n/g) || "").length + 1}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="textarea validator w-full"
                required
                disabled={commandDefinition?.parameters.length === 0}
            />
            <div>
                <Button<void> onClick={onExecute} disabled={!canExecute} className="btn btn-success">
                    {t(($) => $.execute)}
                </Button>
            </div>
            {lastLog && <LastLogResult message={lastLog} />}
        </div>
    );
});

export default CommandExecutor;
