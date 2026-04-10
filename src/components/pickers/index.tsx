import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { AppState } from "../../store.js";
import type { ClusterDefinition } from "../../types.js";

export interface ClusterGroup {
    // keys in i18n "zigbee"
    name: "custom_clusters" | "input_clusters" | "output_clusters" | "other_zcl_clusters" | "available" | "possible";
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

    const stdCluster: BridgeDefinitions["clusters"][keyof BridgeDefinitions["clusters"]] | undefined =
        bridgeDefinitions.clusters[clusterName as keyof typeof bridgeDefinitions.clusters];

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

    const stdCluster: BridgeDefinitions["clusters"][keyof BridgeDefinitions["clusters"]] | undefined =
        bridgeDefinitions.clusters[clusterName as keyof typeof bridgeDefinitions.clusters];

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
