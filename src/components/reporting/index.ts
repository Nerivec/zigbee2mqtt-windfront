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

    if (rule.minimum_report_interval === undefined || Number.isNaN(rule.minimum_report_interval)) {
        return false;
    }

    if (rule.maximum_report_interval === undefined || Number.isNaN(rule.maximum_report_interval)) {
        return false;
    }

    if (rule.reportable_change === undefined || Number.isNaN(rule.reportable_change)) {
        return false;
    }

    return true;
};
