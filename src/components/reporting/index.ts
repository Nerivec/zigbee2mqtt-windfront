import type { Device } from "../../types.js";

export type ReportingRule = {
    isNew?: string;
    endpoint: string;
} & Device["endpoints"][number]["configured_reportings"][number];

export interface ReportingEndpoint {
    endpointId: string;
    rules: ReportingRule[];
}

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
