import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store.js";
import type { Device, LogMessage } from "../../types.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import InputField from "../form-fields/InputField.js";
import TextareaField from "../form-fields/TextareaField.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import type { ClusterGroup } from "../pickers/index.js";
import LastLogResult from "./LastLogResult.js";

interface CommandExecutorProps {
    sourceIdx: number;
    device: Device;
    lastLog: LogMessage | undefined;
}

const CommandExecutor = memo(({ sourceIdx, device, lastLog }: CommandExecutorProps) => {
    const { t } = useTranslation(["common", "zigbee"]);
    const [endpoint, setEndpoint] = useState<number>(1);
    const [cluster, setCluster] = useState<string>("");
    const [command, setCommand] = useState<string>("");
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

        if (deviceEndpoint) {
            for (const inCluster of deviceEndpoint.clusters.input) {
                uniqueClusters.add(inCluster);
                deviceInputs.add(inCluster);
            }

            for (const outCluster of deviceEndpoint.clusters.output) {
                uniqueClusters.add(outCluster);
                deviceOutputs.add(outCluster);
            }
        }

        const customClusters = bridgeDefinitions.custom_clusters[device.friendly_name];

        if (customClusters) {
            for (const key in bridgeDefinitions.custom_clusters[device.friendly_name]) {
                if (!uniqueClusters.has(key)) {
                    uniqueClusters.add(key);
                    deviceCustoms.add(key);
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
                name: "input_clusters",
                clusters: deviceInputs,
            },
            {
                name: "output_clusters",
                clusters: deviceOutputs,
            },
            {
                name: "custom_clusters",
                clusters: deviceCustoms,
            },
            {
                name: "other_zcl_clusters",
                clusters: otherZcls,
            },
        ];
    }, [device.friendly_name, device.endpoints, endpoint, bridgeDefinitions]);

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
                <InputField
                    type="text"
                    name="command"
                    label={t(($) => $.command)}
                    value={command}
                    placeholder={"state, color..."}
                    onChange={(e) => setCommand(e.target.value)}
                    pattern="^\d+|^\w+"
                    required
                />
            </div>
            <TextareaField
                name="payload"
                label={t(($) => $.payload)}
                rows={3}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="textarea validator w-full"
                required
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
