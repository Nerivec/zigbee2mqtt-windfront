import type { Device } from "../../types.js";

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
