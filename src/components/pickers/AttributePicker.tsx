import { type ChangeEvent, type InputHTMLAttributes, type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store.js";
import type { AttributeDefinition, Device } from "../../types.js";
import SelectField from "../form-fields/SelectField.js";

type BridgeDefinitions = Zigbee2MQTTAPI["bridge/definitions"];

interface AttributePickerProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange"> {
    sourceIdx: number;
    cluster: string;
    device: Device;
    label?: string;
    onChange: (attr: string, definition: AttributeDefinition) => void;
}

const AttributePicker = memo(({ sourceIdx, cluster, device, onChange, label, ...rest }: AttributePickerProps) => {
    const bridgeDefinitions = useAppStore(useShallow((state) => state.bridgeDefinitions[sourceIdx]));
    const { t } = useTranslation("zigbee");

    // retrieve cluster attributes, priority to device custom if any, then ZH
    const clusterAttributes = useMemo(() => {
        const deviceCustomClusters: BridgeDefinitions["custom_clusters"][string] | undefined = bridgeDefinitions.custom_clusters[device.ieee_address];

        if (deviceCustomClusters) {
            const customClusters = deviceCustomClusters[cluster];

            if (customClusters) {
                return customClusters.attributes;
            }
        }

        const stdCluster: BridgeDefinitions["clusters"][keyof BridgeDefinitions["clusters"]] | undefined = bridgeDefinitions.clusters[cluster];

        if (stdCluster) {
            return stdCluster.attributes;
        }

        return [];
    }, [bridgeDefinitions, device.ieee_address, cluster]);

    const options = useMemo(() => {
        const attrs: JSX.Element[] = [];

        for (const key in clusterAttributes) {
            attrs.push(
                <option key={key} value={key}>
                    {key}
                </option>,
            );
        }

        return attrs;
    }, [clusterAttributes]);

    return (
        <SelectField
            name="attribute_picker"
            label={label}
            onChange={(e: ChangeEvent<HTMLSelectElement>): void => onChange(e.target.value, clusterAttributes[e.target.value])}
            disabled={options.length === 0}
            className="select validator w-64"
            {...rest}
        >
            <option value="" disabled>
                {t(($) => $.select_attribute)}
            </option>
            {options}
        </SelectField>
    );
});

export default AttributePicker;
