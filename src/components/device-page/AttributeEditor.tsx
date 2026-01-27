import { faDownLong, faMagnifyingGlass, faPen, faQuestion, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, type JSX, memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store.js";
import type { AttributeDefinition, Device, LogMessage } from "../../types.js";
import { getEndpoints, getObjectFirstKey } from "../../utils.js";
import { DataType } from "../../zspec.js";
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
    readReporting(endpoint: string, cluster: string, configs: Zigbee2MQTTAPI["bridge/request/device/reporting/read"]["configs"]): Promise<void>;
    lastLog: LogMessage | undefined;
}

export type AttributeInfo = {
    attribute: string;
    definition: AttributeDefinition;
    value?: string | number | Record<string, unknown> | unknown[];
};

export type AttributeValueInputProps = {
    onChange(attribute: string, value?: string | number): void;
    attribute: string;
    definition: AttributeDefinition;
    value?: string | number | Record<string, unknown> | unknown[];
};

const getTypeFormatHint = (type: DataType): string | undefined => {
    switch (type) {
        case DataType.ARRAY:
        case DataType.SET:
        case DataType.BAG: {
            return `{"elementType": TODO, "elements": [TODO]}`;
        }
        case DataType.STRUCT: {
            return `[{"elmType": TODO, "elmVal": TODO}]`;
        }
        case DataType.TOD: {
            return `{"hours": TODO, "minutes": TODO, "seconds": TODO, "hundredths": TODO}`;
        }
        case DataType.DATE: {
            return `{"year": TODO, "month": TODO, "dayOfMonth": TODO, "dayOfWeek": TODO}`;
        }
        case DataType.SEC_KEY: {
            return "[TODO]"; // number array works fine with `Buffer.from()` used by `Buffalo.writeBuffer`
        }
    }
};

function AttributeValueInput({ value, onChange, attribute, definition }: Readonly<AttributeValueInputProps>): JSX.Element {
    if (
        definition.type === DataType.ARRAY ||
        definition.type === DataType.STRUCT ||
        definition.type === DataType.SET ||
        definition.type === DataType.BAG ||
        definition.type === DataType.TOD ||
        definition.type === DataType.DATE ||
        definition.type === DataType.SEC_KEY
    ) {
        return (
            <input
                type="text"
                className="flex-1 input"
                value={value != null && value !== "" ? (typeof value === "object" ? JSON.stringify(value) : value) : undefined}
                placeholder={getTypeFormatHint(definition.type)}
                onChange={(e) => {
                    onChange(attribute, e.target.value);
                }}
                onBlur={(e) => {
                    if (e.target.value) {
                        // try to convert to object as "final step"
                        // will throw if invalid format
                        const json = JSON.parse(e.target.value);

                        onChange(attribute, json);
                    }
                }}
                disabled={!definition.write}
            />
        );
    }

    const type =
        definition.type === DataType.IEEE_ADDR || (definition.type >= DataType.OCTET_STR && definition.type <= DataType.LONG_CHAR_STR)
            ? "text"
            : "number";

    return (
        <input
            type={type}
            value={value == null || typeof value === "string" || typeof value === "number" ? value : undefined}
            min={definition.minExcl ? definition.minExcl + 1 : definition.min}
            max={definition.maxExcl ? definition.maxExcl - 1 : definition.max}
            minLength={definition.minLen ?? definition.length}
            maxLength={definition.maxLen ?? definition.length}
            onChange={(e): void => {
                const val = type === "number" ? e.target.valueAsNumber : e.target.value;

                onChange(attribute, Number.isNaN(val) ? undefined : val);
            }}
            disabled={!definition.write}
            className="flex-1 input validator"
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
                <fieldset className="fieldset gap-1 p-3 bg-base-200 rounded-box shadow-md border border-base-300 w-full">
                    {attributes.map(({ attribute, value = "", definition }) => (
                        <div key={attribute} className="w-full flex flex-row items-center rounded-box p-1.5 hover:bg-base-100">
                            <div className="flex-1 self-center text-[0.85rem] flex flex-row items-center gap-1">
                                {attribute} ({DataType[definition.type]})
                                {definition.required ? null : (
                                    <span className={"tooltip tooltip-right"} data-tip={t(($) => $.attribute_not_required, { ns: "zigbee" })}>
                                        <FontAwesomeIcon icon={faQuestion} className="text-warning" />
                                    </span>
                                )}
                                {definition.read === false ? (
                                    <span className={"tooltip tooltip-right"} data-tip={t(($) => $.attribute_not_readable, { ns: "zigbee" })}>
                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-error" />
                                    </span>
                                ) : null}
                                {definition.write ? null : (
                                    <span className={"tooltip tooltip-right"} data-tip={t(($) => $.attribute_not_writable, { ns: "zigbee" })}>
                                        <FontAwesomeIcon icon={faPen} className="text-error" />
                                    </span>
                                )}
                                {definition.report ? null : (
                                    <span className={"tooltip tooltip-right"} data-tip={t(($) => $.attribute_report_not_required, { ns: "zigbee" })}>
                                        <FontAwesomeIcon icon={faDownLong} className="text-warning" />
                                    </span>
                                )}
                            </div>
                            <Button<string>
                                className="btn btn-error btn-outline mx-2"
                                item={attribute}
                                onClick={(attribute): void => {
                                    const newAttributes = attributes.filter((info) => info.attribute !== attribute);

                                    setAttributes(newAttributes);
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
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
                        </div>
                    ))}
                </fieldset>
            ),
        [attributes, t],
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
            <div className="w-full flex flex-row flex-wrap justify-between gap-2">
                <div className="w-full flex flex-row justify-between">
                    <Button<void>
                        disabled={
                            disableButtons || attributes.some((attr) => attr.definition.read === false || (attr.value != null && attr.value !== ""))
                        }
                        className="btn btn-success"
                        onClick={onReadClick}
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        {t(($) => $.read)}
                    </Button>
                    <Button<void>
                        disabled={disableButtons || attributes.some((attr) => !attr.definition.write)}
                        className="btn btn-error"
                        onClick={onWriteClick}
                    >
                        <FontAwesomeIcon icon={faPen} />
                        {t(($) => $.write)}
                    </Button>
                </div>
                <ConfirmButton<void>
                    disabled={disableButtons || attributes.some((attr) => attr.value != null && attr.value !== "")}
                    className="btn btn-accent"
                    onClick={onReadReportingClick}
                    title={t(($) => $.sync_reporting)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt)}
                    modalCancelLabel={t(($) => $.cancel)}
                >
                    <FontAwesomeIcon icon={faDownLong} />
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
