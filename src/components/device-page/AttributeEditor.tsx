import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, type JSX, memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store.js";
import type { AttributeDefinition, Device, LogMessage } from "../../types.js";
import { getEndpoints, getObjectFirstKey } from "../../utils.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";
import InputField from "../form-fields/InputField.js";
import AttributePicker from "../pickers/AttributePicker.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import type { ClusterGroup } from "../pickers/index.js";
import LastLogResult from "./LastLogResult.js";

export interface AttributeEditorProps {
    sourceIdx: number;
    device: Device;
    read(endpoint: string, cluster: string, attributes: string[], stateProperty?: string): Promise<void>;
    write(endpoint: string, cluster: string, attributes: AttributeInfo[]): Promise<void>;
    readReporting(endpoint: string, cluster: string, configs: Zigbee2MQTTAPI["bridge/request/device/reporting/read"]["configs"]);
    lastLog: LogMessage | undefined;
}

export type AttributeInfo = {
    attribute: string;
    definition: AttributeDefinition;
    value?: string | number;
};

export type AttributeValueInputProps = {
    onChange(attribute: string, value?: string | number): void;
    attribute: string;
    definition: AttributeDefinition;
    value?: string | number;
};

const TEXT_DATA_TYPES = [65 /* DataType.OCTET_STR */, 66 /* DataType.CHAR_STR */, 67 /* DataType.LONG_OCTET_STR */, 68 /* DataType.LONG_CHAR_STR */];

function AttributeValueInput({ value, onChange, attribute, definition, ...rest }: Readonly<AttributeValueInputProps>): JSX.Element {
    const type = TEXT_DATA_TYPES.includes(definition.type) ? "text" : "number";

    return (
        <input
            type={type}
            value={value}
            onChange={(e): void => {
                const val = type === "number" ? e.target.valueAsNumber : e.target.value;

                onChange(attribute, Number.isNaN(val) ? undefined : val);
            }}
            {...rest}
        />
    );
}

const AttributeEditor = memo(({ sourceIdx, device, read, write, readReporting, lastLog }: AttributeEditorProps) => {
    const bridgeDefinitions = useAppStore(useShallow((state) => state.bridgeDefinitions[sourceIdx]));
    const [endpoint, setEndpoint] = useState(getObjectFirstKey(device.endpoints) ?? "");
    const [cluster, setCluster] = useState("");
    const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
    const [stateProperty, setStateProperty] = useState<string>("");
    const { t } = useTranslation(["common", "zigbee", "devConsole"]);

    const onEndpointChange = useCallback((endpoint: string | number) => {
        setCluster("");
        setAttributes([]);
        setEndpoint(endpoint.toString());
    }, []);

    const onClusterChange = useCallback((cluster: string) => {
        setAttributes([]);
        setCluster(cluster);
    }, []);

    const onAttributeChange = useCallback(
        (attribute: string, definition: AttributeDefinition): void => {
            if (!attributes.find((info) => info.attribute === attribute)) {
                const newAttributes = attributes.concat([{ attribute, definition }]);

                setAttributes(newAttributes);
            }
        },
        [attributes],
    );

    const onStatePropertyChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setStateProperty(event.target.value);
    }, []);

    const onReadClick = useCallback(async () => {
        await read(
            endpoint,
            cluster,
            attributes.map((info) => info.attribute),
            stateProperty,
        );
    }, [endpoint, cluster, attributes, stateProperty, read]);

    const onWriteClick = useCallback(async () => {
        await write(endpoint, cluster, attributes);
    }, [endpoint, cluster, attributes, write]);

    const onReadReportingClick = useCallback(async () => {
        await readReporting(
            endpoint,
            cluster,
            attributes.map((info) => ({ attribute: info.attribute })),
        );
    }, [endpoint, cluster, attributes, readReporting]);

    const selectedAttributes = useMemo(
        () =>
            attributes.length > 0 && (
                <fieldset className="fieldset gap-2 p-3 bg-base-200 rounded-box shadow-md border border-base-300 w-full">
                    {attributes.map(({ attribute, value = "", definition }) => (
                        <div key={attribute} className="join join-horizontal min-w-xs w-full">
                            <label className="input join-item grow">
                                {attribute}
                                <AttributeValueInput
                                    value={value}
                                    attribute={attribute}
                                    definition={definition}
                                    onChange={(attribute, value): void => {
                                        const newAttributes = Array.from(attributes);
                                        const attr = newAttributes.find((info) => info.attribute === attribute);

                                        if (attr) {
                                            attr.value = value;
                                        }

                                        setAttributes(newAttributes);
                                    }}
                                />
                            </label>
                            <Button<string>
                                className="btn btn-error btn-outline join-item"
                                item={attribute}
                                onClick={(attribute): void => {
                                    const newAttributes = attributes.filter((info) => info.attribute !== attribute);

                                    setAttributes(newAttributes);
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </div>
                    ))}
                </fieldset>
            ),
        [attributes],
    );
    const availableClusters = useMemo((): ClusterGroup[] => {
        const deviceInputs = new Set<string>();
        const deviceCustoms = new Set<string>();
        const otherZcls = new Set<string>();

        if (endpoint) {
            const deviceEndpoint = device.endpoints[Number.parseInt(endpoint, 10)];
            const uniqueClusters = new Set<string>();

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
            }

            for (const key in bridgeDefinitions.clusters) {
                if (!uniqueClusters.has(key)) {
                    otherZcls.add(key);
                }
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
                name: "other_zcl_clusters",
                clusters: otherZcls,
            },
        ];
    }, [device, endpoint, bridgeDefinitions]);

    const disableButtons = attributes.length === 0 || cluster === "";
    const endpoints = useMemo(() => getEndpoints(device), [device]);

    return endpoint ? (
        <div className="flex-1 flex flex-col gap-3 w-full">
            <h2 className="text-lg">{t(($) => $.read_write_attributes, { ns: "zigbee" })}</h2>
            <div className="flex flex-row flex-wrap gap-2">
                <EndpointPicker
                    label={t(($) => $.endpoint, { ns: "zigbee" })}
                    values={endpoints}
                    value={endpoint}
                    onChange={onEndpointChange}
                    required
                />
                <ClusterSinglePicker label={t(($) => $.cluster)} clusters={availableClusters} value={cluster} onChange={onClusterChange} required />
                <AttributePicker
                    sourceIdx={sourceIdx}
                    label={t(($) => $.attribute)}
                    value={""}
                    cluster={cluster}
                    device={device}
                    onChange={onAttributeChange}
                />
                <InputField
                    type="text"
                    name="state_property"
                    label={t(($) => $.state_property, { ns: "devConsole" })}
                    value={stateProperty}
                    detail={`${t(($) => $.optional)}. ${t(($) => $.state_property_info, { ns: "devConsole" })}`}
                    onChange={onStatePropertyChange}
                />
            </div>
            {selectedAttributes}
            <div className="flex flex-row flex-wrap justify-between gap-2">
                <div className="join join-horizontal">
                    <Button<void>
                        disabled={disableButtons || attributes.some((attr) => !!attr.value)}
                        className="btn btn-success join-item"
                        onClick={onReadClick}
                    >
                        {t(($) => $.read)}
                    </Button>
                    <Button<void> disabled={disableButtons} className="btn btn-error join-item" onClick={onWriteClick}>
                        {t(($) => $.write)}
                    </Button>
                </div>
                <ConfirmButton<void>
                    disabled={disableButtons || attributes.some((attr) => !!attr.value)}
                    className="btn btn-accent join-item"
                    onClick={onReadReportingClick}
                    title={t(($) => $.sync_reporting)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt)}
                    modalCancelLabel={t(($) => $.cancel)}
                >
                    {t(($) => $.sync_reporting)}
                </ConfirmButton>
            </div>
            {lastLog && <LastLogResult message={lastLog} />}
        </div>
    ) : (
        <span>No endpoints</span>
    );
});

export default AttributeEditor;
