import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { AppState } from "../../store.js";
import type { AttributeDefinition, ClusterDefinition, Device } from "../../types.js";

export type ReportingRule = {
    isNew?: string;
    endpoint: string;
} & Device["endpoints"][number]["configured_reportings"][number];

export interface ReportingEndpoint {
    endpointId: string;
    rules: ReportingRule[];
}

type BridgeDefinitions = Zigbee2MQTTAPI["bridge/definitions"];

export const isDiscreteOrCompositeDataType = (attrDefinition: AttributeDefinition): boolean =>
    (attrDefinition.type >= 0x08 && attrDefinition.type <= 0x1f) ||
    attrDefinition.type === 0x30 ||
    attrDefinition.type === 0x31 ||
    (attrDefinition.type >= 0x41 && attrDefinition.type <= 0x51) ||
    (attrDefinition.type >= 0xe8 && attrDefinition.type <= 0xf1);

export const isAnalogDataType = (attrDefinition: AttributeDefinition): boolean =>
    (attrDefinition.type >= 0x20 && attrDefinition.type <= 0x2f) ||
    (attrDefinition.type >= 0x38 && attrDefinition.type <= 0x3a) ||
    (attrDefinition.type >= 0xe0 && attrDefinition.type <= 0xe2);

export const getClusterAttributes = (
    bridgeDefinitions: AppState["bridgeDefinitions"][number],
    deviceIeeeAddress: string,
    clusterName: string,
): ClusterDefinition["attributes"] => {
    const deviceCustomClusters: BridgeDefinitions["custom_clusters"][string] | undefined = bridgeDefinitions.custom_clusters[deviceIeeeAddress];

    if (deviceCustomClusters) {
        const customClusters = deviceCustomClusters[clusterName];

        if (customClusters) {
            return customClusters.attributes;
        }
    }

    const stdCluster: BridgeDefinitions["clusters"][keyof BridgeDefinitions["clusters"]] | undefined = bridgeDefinitions.clusters[clusterName];

    if (stdCluster) {
        return stdCluster.attributes;
    }

    return {};
};

export const getClusterAttribute = (
    bridgeDefinitions: AppState["bridgeDefinitions"][number],
    deviceIeeeAddress: string,
    clusterName: string,
    attribute: string | number,
): ClusterDefinition["attributes"][string] | undefined => {
    return getClusterAttributes(bridgeDefinitions, deviceIeeeAddress, clusterName)[attribute];
};

export const makeDefaultReporting = (ieeeAddress: string, endpoint: string): ReportingRule => ({
    isNew: ieeeAddress,
    reportable_change: 0,
    minimum_report_interval: 60,
    maximum_report_interval: 3600,
    endpoint,
    cluster: "",
    attribute: "",
});

export const aggregateReporting = (device: Device): ReportingEndpoint[] => {
    const byEndpoints: ReportingEndpoint[] = [];

    for (const key in device.endpoints) {
        const endpoint = device.endpoints[key];
        const rules = endpoint.configured_reportings.map((cr) => ({
            ...cr,
            endpoint: key,
        }));

        byEndpoints.push({ endpointId: key, rules });
    }

    return byEndpoints;
};

export const isValidReportingRuleEdit = (
    minRepInterval: number | undefined | null | "",
    maxRepInterval: number | undefined | null | "",
    repChange: number | undefined | null | "",
): boolean => {
    if (minRepInterval == null || minRepInterval === "" || Number.isNaN(minRepInterval)) {
        return false;
    }

    if (maxRepInterval == null || maxRepInterval === "" || Number.isNaN(maxRepInterval)) {
        return false;
    }

    if (repChange === "" || Number.isNaN(repChange)) {
        return false;
    }

    // can't be greater unless used to signal "default reporting configuration"
    if (minRepInterval > maxRepInterval && !(maxRepInterval === 0x0000 && minRepInterval === 0xffff && repChange === 0)) {
        return false;
    }

    return true;
};

export const isValidReportingRule = (rule: ReportingRule): boolean => {
    if (rule.endpoint === undefined || rule.endpoint === "") {
        return false;
    }

    if (rule.cluster === undefined || rule.cluster === "") {
        return false;
    }

    if (rule.attribute === undefined || rule.attribute === "") {
        return false;
    }

    return isValidReportingRuleEdit(rule.minimum_report_interval, rule.maximum_report_interval, rule.reportable_change);
};
