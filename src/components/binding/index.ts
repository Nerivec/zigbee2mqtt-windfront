import type { Device, Group } from "../../types.js";

export type BindingRuleTargetGroup = {
    type: "group";
    id: number;
};

export type BindingRuleTargetDevice = {
    type: "endpoint";
    endpoint: string | number;
    ieee_address: string;
};

export interface BindingRule {
    id?: number;
    isNew?: true;
    source: {
        ieee_address: string;
        endpoint: string | number;
    };
    target: BindingRuleTargetGroup | BindingRuleTargetDevice;
    clusters: string[];
}

export type Action = "Bind" | "Unbind";

export interface BindingEndpoint {
    endpointId: string;
    rules: BindingRule[];
}

export const makeDefaultBinding = (ieeeAddress: string, endpoint: string): BindingRule => ({
    isNew: true,
    target: { type: "endpoint", ieee_address: "", endpoint: "" },
    source: { ieee_address: ieeeAddress, endpoint },
    clusters: [],
});

export const aggregateBindings = (device: Device): BindingRule[] => {
    const bindings: Record<string, BindingRule> = {};

    for (const endpoint in device.endpoints) {
        const endpointDesc = device.endpoints[endpoint];

        for (const binding of endpointDesc.bindings) {
            let targetId = "ieee_address" in binding.target ? `${binding.target.ieee_address}-${binding.target.endpoint}` : binding.target.id;

            targetId = `${targetId}-${endpoint}`;

            if (bindings[targetId]) {
                bindings[targetId].clusters.push(binding.cluster);
            } else {
                bindings[targetId] = {
                    source: {
                        ieee_address: device.ieee_address,
                        endpoint,
                    },
                    target: { ...binding.target },
                    clusters: [binding.cluster],
                };
            }
        }
    }

    return Object.values(bindings);
};

export const aggregateBindingsByEndpoints = (device: Device): BindingEndpoint[] => {
    const byEndpoints: BindingEndpoint[] = [];

    for (const endpoint in device.endpoints) {
        const endpointDesc = device.endpoints[endpoint];
        const rulesByTarget: Record<string, BindingRule> = {};

        for (const binding of endpointDesc.bindings) {
            const targetKey =
                "ieee_address" in binding.target ? `${binding.target.ieee_address}-${binding.target.endpoint}` : `group-${binding.target.id}`;

            if (rulesByTarget[targetKey]) {
                rulesByTarget[targetKey].clusters.push(binding.cluster);
            } else {
                rulesByTarget[targetKey] = {
                    source: {
                        ieee_address: device.ieee_address,
                        endpoint,
                    },
                    target: { ...binding.target },
                    clusters: [binding.cluster],
                };
            }
        }

        byEndpoints.push({ endpointId: endpoint, rules: Object.values(rulesByTarget) });
    }

    return byEndpoints;
};

export const findPossibleClusters = (rule: BindingRule, deviceEndpoints: Device["endpoints"], target?: Device | Group) => {
    const clusters: Set<string> = new Set(rule.clusters);
    const srcEndpoint = deviceEndpoints[rule.source.endpoint];
    const dstEndpoint =
        rule.target.type === "endpoint" && rule.target.endpoint != null ? (target as Device | undefined)?.endpoints[rule.target.endpoint] : undefined;
    const allClustersValid = rule.target.type === "group" || (target as Device | undefined)?.type === "Coordinator";

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
};

export const getRuleDst = (
    target: BindingRule["target"],
    devices: Device[],
    groups: Group[],
): { to: string | number; toEndpoint?: string | number } | undefined => {
    if (target.type === "group") {
        const targetGroup = groups.find((group) => group.id === target.id);

        if (!targetGroup) {
            console.error("Target group does not exist:", target.id);
            return;
        }

        return { to: targetGroup.id };
    }

    const targetDevice = devices.find((device) => device.ieee_address === target.ieee_address);

    if (!targetDevice) {
        console.error("Target device does not exist:", target.ieee_address);
        return;
    }

    return { to: targetDevice.ieee_address, toEndpoint: targetDevice.type !== "Coordinator" ? target.endpoint : undefined };
};

export const isValidBindingRule = (rule: BindingRule): boolean => {
    if (rule.source.endpoint === undefined || rule.source.endpoint === "" || Number.isNaN(rule.source.endpoint)) {
        return false;
    }

    if (!Array.isArray(rule.clusters) || rule.clusters.length === 0) {
        return false;
    }

    if (rule.target.type === "endpoint") {
        if (!rule.target.ieee_address) {
            return false;
        }

        if (rule.target.endpoint === undefined || rule.target.endpoint === "" || Number.isNaN(rule.target.endpoint)) {
            return false;
        }
    } else if (rule.target.type === "group") {
        if (rule.target.id === undefined || Number.isNaN(rule.target.id)) {
            return false;
        }
    }

    return true;
};
