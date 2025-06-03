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
    rule: NiceReportingRule;
    device: Device;
    onApply(rule: NiceReportingRule): void;
}

interface ReportingRowState {
    rule: NiceReportingRule;
}

const REQUIRED_RULE_FIELDS = ["maximum_report_interval", "minimum_report_interval", "reportable_change", "endpoint", "cluster", "attribute"];

const ReportingRow = memo((props: ReportingRowProps) => {
    const { rule, device, onApply } = props;
    const [state, setState] = useState<ReportingRowState>({ rule });
    const { t } = useTranslation(["zigbee", "common"]);

    useEffect(() => {
        setState({ rule });
    }, [rule]);

    const onSourceEndpointChange = useCallback(
        (sourceEp: string): void => {
            state.rule.endpoint = sourceEp;

            setState({ rule: state.rule });
        },
        [state],
    );

    const onClusterChange = useCallback(
        (cluster: string): void => {
            state.rule.cluster = cluster;

            setState({ rule: state.rule });
        },
        [state],
    );

    const onAttributeChange = useCallback(
        (attr: string): void => {
            state.rule.attribute = attr;

            setState({ rule: state.rule });
        },
        [state],
    );

    const onReportNumberChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            const { name, valueAsNumber } = event.target;
            state.rule[name] = valueAsNumber;

            setState({ rule: state.rule });
        },
        [state],
    );

    const onDisableRuleClick = useCallback((): void => {
        onApply({ ...state.rule, maximum_report_interval: 0xffff });
    }, [state, onApply]);

    const sourceEndpoints = useMemo(() => getEndpoints(device), [device]);

    const clusters = useMemo((): ClusterGroup[] => {
        const possibleClusters = new Set<string>();
        const availableClusters = new Set<string>();

        if (state.rule.cluster) {
            availableClusters.add(state.rule.cluster);
        }

        const ep = device.endpoints[Number.parseInt(state.rule.endpoint, 10)];

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
    }, [device.endpoints, state.rule.endpoint, state.rule.cluster]);

    const isValidRule = useMemo(() => {
        return REQUIRED_RULE_FIELDS.every((field) => state.rule[field] !== undefined && state.rule[field] !== "");
    }, [state]);

    return (
        <>
            <div className="flex flex-row flex-wrap gap-2">
                <EndpointPicker
                    label={t("endpoint")}
                    disabled={!rule.isNew}
                    values={sourceEndpoints}
                    value={state.rule.endpoint}
                    onChange={onSourceEndpointChange}
                    required
                />
                <ClusterSinglePicker
                    label={t("cluster")}
                    disabled={!state.rule.endpoint}
                    clusters={clusters}
                    value={state.rule.cluster}
                    onChange={onClusterChange}
                    required
                />
                <AttributePicker
                    label={t("attribute")}
                    disabled={!state.rule.cluster}
                    value={state.rule.attribute}
                    cluster={state.rule.cluster}
                    device={device}
                    onChange={onAttributeChange}
                    required
                />
                <InputField
                    name="minimum_report_interval"
                    label={t("min_rep_interval")}
                    type="number"
                    value={state.rule.minimum_report_interval}
                    onChange={onReportNumberChange}
                    required
                />
                <InputField
                    name="maximum_report_interval"
                    label={t("max_rep_interval")}
                    type="number"
                    value={state.rule.maximum_report_interval}
                    onChange={onReportNumberChange}
                    required
                />
                <InputField
                    name="reportable_change"
                    label={t("min_rep_change")}
                    type="number"
                    value={state.rule.reportable_change}
                    onChange={onReportNumberChange}
                    required
                />
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{t("actions")}</legend>
                    <div className="join join-horizontal">
                        <Button<NiceReportingRule> className="btn btn-primary join-item" item={state.rule} onClick={onApply} disabled={!isValidRule}>
                            {t("common:apply")}
                        </Button>
                        {!state.rule.isNew ? (
                            <ConfirmButton<void>
                                title={t("common:disable")}
                                className="btn btn-error join-item"
                                onClick={onDisableRuleClick}
                                modalDescription={t("common:dialog_confirmation_prompt")}
                                modalCancelLabel={t("common:cancel")}
                            >
                                {t("common:disable")}
                            </ConfirmButton>
                        ) : null}
                    </div>
                </fieldset>
            </div>
            <div className="divider" />
        </>
    );
});

export default ReportingRow;
