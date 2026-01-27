import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { AppState } from "../../store.js";
import type { ClusterDefinition } from "../../types.js";

export interface ClusterGroup {
    name: string;
    clusters: Set<string>;
}

type BridgeDefinitions = Zigbee2MQTTAPI["bridge/definitions"];

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

export const getClusterCommands = (
    bridgeDefinitions: AppState["bridgeDefinitions"][number],
    deviceIeeeAddress: string,
    clusterName: string,
): ClusterDefinition["commands"] => {
    const deviceCustomClusters: BridgeDefinitions["custom_clusters"][string] | undefined = bridgeDefinitions.custom_clusters[deviceIeeeAddress];

    if (deviceCustomClusters) {
        const customClusters = deviceCustomClusters[clusterName];

        if (customClusters) {
            return customClusters.commands;
        }
    }

    const stdCluster: BridgeDefinitions["clusters"][keyof BridgeDefinitions["clusters"]] | undefined = bridgeDefinitions.clusters[clusterName];

    if (stdCluster) {
        return stdCluster.commands;
    }

    return {};
};

export const getClusterCommand = (
    bridgeDefinitions: AppState["bridgeDefinitions"][number],
    deviceIeeeAddress: string,
    clusterName: string,
    command: string | number,
): ClusterDefinition["commands"][string] | undefined => {
    return getClusterCommands(bridgeDefinitions, deviceIeeeAddress, clusterName)[command];
};
