import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, type JSX, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AttributeDefinition, Device, LogMessage } from "../../types.js";
import { getEndpoints, getObjectFirstKey } from "../../utils.js";
import Button from "../Button.js";
import InputField from "../form-fields/InputField.js";
import AttributePicker from "../pickers/AttributePicker.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import LastLogResult from "./LastLogResult.js";

export interface AttributeEditorProps {
    device: Device;
    lastLog?: LogMessage;
    readDeviceAttributes(id: string, endpoint: string, cluster: string, attributes: string[], stateProperty?: string): Promise<void>;
    writeDeviceAttributes(id: string, endpoint: string, cluster: string, attributes: AttributeInfo[]): Promise<void>;
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

function AttributeValueInput(props: Readonly<AttributeValueInputProps>): JSX.Element {
    const { value, onChange, attribute, definition, ...rest } = props;
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

export function AttributeEditor(props: AttributeEditorProps) {
    const { device, readDeviceAttributes, writeDeviceAttributes, lastLog } = props;
    const [endpoint, setEndpoint] = useState(getObjectFirstKey(device.endpoints) ?? "");
    const [cluster, setCluster] = useState("");
    const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
    const [stateProperty, setStateProperty] = useState<string>("");
    const { t } = useTranslation(["common", "zigbee"]);

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
        await readDeviceAttributes(
            device.ieee_address,
            endpoint,
            cluster,
            attributes.map((info) => info.attribute),
            stateProperty,
        );
    }, [device.ieee_address, endpoint, cluster, attributes, stateProperty, readDeviceAttributes]);

    const onWriteClick = useCallback(async () => {
        await writeDeviceAttributes(device.ieee_address, endpoint, cluster, attributes);
    }, [device.ieee_address, endpoint, cluster, attributes, writeDeviceAttributes]);

    const selectedAttributes = useMemo(
        () =>
            attributes.length > 0 && (
                <fieldset className="fieldset gap-2 p-3 rounded-box shadow-md">
                    {attributes.map(({ attribute, value = "", definition }) => (
                        <div key={attribute} className="join join-horizontal min-w-xs">
                            {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                            <label className="input join-item">
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
    const availableClusters = useMemo(() => {
        const clusters = new Set<string>();

        if (endpoint) {
            const deviceEndpoint = device.endpoints[Number.parseInt(endpoint, 10)];

            if (deviceEndpoint) {
                for (const inCluster of deviceEndpoint.clusters.input) {
                    clusters.add(inCluster);
                }
            }
        }

        return clusters;
    }, [device, endpoint]);

    const disableButtons = attributes.length === 0 || cluster === "";
    const endpoints = useMemo(() => getEndpoints(device), [device]);

    return endpoint ? (
        <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-lg">{t("zigbee:read_write_attributes")}</h2>
            <div className="flex flex-row flex-wrap gap-2">
                <EndpointPicker label={t("zigbee:endpoint")} values={endpoints} value={endpoint} onChange={onEndpointChange} required />
                <ClusterSinglePicker label={t("cluster")} clusters={availableClusters} value={cluster} onChange={onClusterChange} required />
                <AttributePicker label={t("attribute")} value={""} cluster={cluster} device={device} onChange={onAttributeChange} />
                <InputField
                    type="text"
                    name="state_property"
                    label={t("devConsole:state_property")}
                    value={stateProperty}
                    detail={`${t("optional")}. ${t("devConsole:state_property_info")}`}
                    onChange={onStatePropertyChange}
                />
            </div>
            {selectedAttributes}
            <div className="join join-horizontal">
                <Button<void>
                    disabled={disableButtons || attributes.some((attr) => !!attr.value)}
                    className="btn btn-success join-item"
                    onClick={onReadClick}
                >
                    {t("read")}
                </Button>
                <Button<void> disabled={disableButtons} className="btn btn-error join-item" onClick={onWriteClick}>
                    {t("write")}
                </Button>
            </div>
            {lastLog && <LastLogResult message={lastLog} />}
        </div>
    ) : (
        <span>No endpoints</span>
    );
}
