import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../types.js";
import { getEndpoints } from "../../utils.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";
import InputField from "../form-fields/InputField.js";
import AttributePicker from "../pickers/AttributePicker.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import type { ClusterGroup } from "../pickers/index.js";
import type { NiceReportingRule } from "./tabs/Reporting.js";

interface ReportingRowProps {
    sourceIdx: number;
    rule: NiceReportingRule;
    device: Device;
    onApply(rule: NiceReportingRule): void;
}

const REQUIRED_RULE_FIELDS = ["maximum_report_interval", "minimum_report_interval", "reportable_change", "endpoint", "cluster", "attribute"] as const;

const ReportingRow = memo(({ sourceIdx, rule, device, onApply }: ReportingRowProps) => {
    const [stateRule, setStateRule] = useState(rule);
    const { t } = useTranslation(["zigbee", "common"]);

    useEffect(() => {
        setStateRule(rule);
    }, [rule]);

    const onSourceEndpointChange = useCallback((endpoint: string): void => {
        setStateRule((prev) => ({ ...prev, endpoint }));
    }, []);

    const onClusterChange = useCallback((cluster: string): void => {
        setStateRule((prev) => ({ ...prev, cluster }));
    }, []);

    const onAttributeChange = useCallback((attribute: string): void => {
        setStateRule((prev) => ({ ...prev, attribute }));
    }, []);

    const onReportNumberChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const { name, valueAsNumber } = event.target;

        setStateRule((prev) => ({
            ...prev,
            [name as "minimum_report_interval" | "maximum_report_interval" | "reportable_change"]: valueAsNumber,
        }));
    }, []);

    const onDisableRuleClick = useCallback((): void => {
        onApply({ ...stateRule, maximum_report_interval: 0xffff });
    }, [stateRule, onApply]);

    const sourceEndpoints = useMemo(() => getEndpoints(device), [device]);

    const clusters = useMemo((): ClusterGroup[] => {
        const possibleClusters = new Set<string>();
        const availableClusters = new Set<string>();

        if (stateRule.cluster) {
            availableClusters.add(stateRule.cluster);
        }

        const ep = device.endpoints[Number.parseInt(stateRule.endpoint, 10)];

        if (ep) {
            for (const outputCluster of ep.clusters.output) {
                availableClusters.add(outputCluster);
            }

            for (const inputCluster of ep.clusters.input) {
                if (!availableClusters.has(inputCluster)) {
                    possibleClusters.add(inputCluster);
                }
            }
        }

        return [
            {
                name: "available",
                clusters: availableClusters,
            },
            {
                name: "possible",
                clusters: possibleClusters,
            },
        ];
    }, [device.endpoints, stateRule.endpoint, stateRule.cluster]);

    const isValidRule = useMemo(() => {
        return REQUIRED_RULE_FIELDS.every((field) => stateRule[field] !== undefined && stateRule[field] !== "");
    }, [stateRule]);

    return (
        <>
            <div className="flex flex-row flex-wrap gap-2">
                <EndpointPicker
                    label={t(($) => $.endpoint)}
                    disabled={!rule.isNew}
                    values={sourceEndpoints}
                    value={stateRule.endpoint}
                    onChange={onSourceEndpointChange}
                    required
                />
                <ClusterSinglePicker
                    label={t(($) => $.cluster)}
                    disabled={!stateRule.endpoint}
                    clusters={clusters}
                    value={stateRule.cluster}
                    onChange={onClusterChange}
                    required
                />
                <AttributePicker
                    sourceIdx={sourceIdx}
                    label={t(($) => $.attribute)}
                    disabled={!stateRule.cluster}
                    value={stateRule.attribute}
                    cluster={stateRule.cluster}
                    device={device}
                    onChange={onAttributeChange}
                    required
                />
                <InputField
                    name="minimum_report_interval"
                    label={t(($) => $.min_rep_interval)}
                    type="number"
                    value={stateRule.minimum_report_interval}
                    onChange={onReportNumberChange}
                    required
                    className="input validator max-w-48"
                />
                <InputField
                    name="maximum_report_interval"
                    label={t(($) => $.max_rep_interval)}
                    type="number"
                    value={stateRule.maximum_report_interval}
                    onChange={onReportNumberChange}
                    required
                    className="input validator max-w-48"
                />
                <InputField
                    name="reportable_change"
                    label={t(($) => $.min_rep_change)}
                    type="number"
                    value={stateRule.reportable_change}
                    onChange={onReportNumberChange}
                    required
                    className="input validator max-w-48"
                />
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{t(($) => $.actions)}</legend>
                    <div className="join join-horizontal">
                        <Button<NiceReportingRule>
                            className="btn btn-primary btn-outline join-item"
                            item={stateRule}
                            onClick={onApply}
                            disabled={!isValidRule}
                        >
                            {t(($) => $.apply, { ns: "common" })}
                        </Button>
                        {!stateRule.isNew ? (
                            <ConfirmButton<void>
                                title={t(($) => $.disable, { ns: "common" })}
                                className="btn btn-error btn-outline join-item"
                                onClick={onDisableRuleClick}
                                modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                            >
                                {t(($) => $.disable, { ns: "common" })}
                            </ConfirmButton>
                        ) : null}
                    </div>
                </fieldset>
            </div>
            <div className="divider my-1" />
        </>
    );
});

export default ReportingRow;
