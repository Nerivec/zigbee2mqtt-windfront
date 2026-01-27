import { faArrowsRotate, faBan, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { AttributeDefinition, Device } from "../../types.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";
import InputField from "../form-fields/InputField.js";
import AttributePicker from "../pickers/AttributePicker.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import type { ClusterGroup } from "../pickers/index.js";
import { getClusterAttributes } from "../pickers/index.js";
import { isAnalogDataType, isValidReportingRule, type ReportingRule } from "../reporting/index.js";

interface ReportingRowProps {
    sourceIdx: number;
    rule: ReportingRule;
    bridgeDefinitions: AppState["bridgeDefinitions"][number];
    device: Device;
    onApply(rule: ReportingRule): Promise<void>;
    onSync?: ([sourceIdx, id, endpoint, cluster, attribute]: [number, string, number, string, string]) => Promise<void>;
    showDivider: boolean;
    showOnlyApply?: boolean;
}

const ReportingRow = memo(
    ({ sourceIdx, rule, bridgeDefinitions, device, onApply, onSync, showDivider, showOnlyApply = false }: ReportingRowProps) => {
        const [stateRule, setStateRule] = useState(rule);
        const [attrDefinition, setAttrDefinition] = useState<AttributeDefinition | null>(null);
        const { t } = useTranslation(["zigbee", "common"]);

        useEffect(() => {
            setStateRule(rule);

            const clusterAttrs = getClusterAttributes(bridgeDefinitions, device.ieee_address, rule.cluster);

            setAttrDefinition(clusterAttrs[rule.attribute] ?? null);
        }, [rule, bridgeDefinitions, device.ieee_address]);

        const onClusterChange = useCallback((cluster: string): void => {
            setStateRule((prev) => ({ ...prev, cluster }));
        }, []);

        const onAttributeChange = useCallback((attribute: string, definition: AttributeDefinition): void => {
            setStateRule((prev) => ({ ...prev, attribute }));
            setAttrDefinition(definition);
        }, []);

        const onReportNumberChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
            setStateRule((prev) => ({
                ...prev,
                [event.target.name as "minimum_report_interval" | "maximum_report_interval" | "reportable_change"]: event.target.value
                    ? event.target.valueAsNumber
                    : "",
            }));
        }, []);

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

        // default to consider analog if can't find attribute definition
        const isAnalogAttribute = useMemo(() => attrDefinition == null || isAnalogDataType(attrDefinition), [attrDefinition]);
        const isValidRule = useMemo(() => isValidReportingRule(stateRule), [stateRule]);

        return (
            <>
                <div className="flex flex-row flex-wrap gap-2">
                    <ClusterSinglePicker
                        label={t(($) => $.cluster)}
                        disabled={!stateRule.endpoint || !stateRule.isNew}
                        clusters={clusters}
                        value={stateRule.cluster}
                        onChange={onClusterChange}
                        required
                    />
                    <AttributePicker
                        sourceIdx={sourceIdx}
                        label={t(($) => $.attribute)}
                        disabled={!stateRule.cluster || !stateRule.isNew}
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
                        value={stateRule.minimum_report_interval ?? ""}
                        onChange={onReportNumberChange}
                        required
                        className="input validator w-48"
                        min={0}
                        max={0xffff}
                    />
                    <InputField
                        name="maximum_report_interval"
                        label={t(($) => $.max_rep_interval)}
                        type="number"
                        value={stateRule.maximum_report_interval ?? ""}
                        onChange={onReportNumberChange}
                        required
                        className="input validator w-48"
                        min={0}
                        max={0xffff}
                    />
                    {isAnalogAttribute ? (
                        <InputField
                            name="reportable_change"
                            label={t(($) => $.min_rep_change)}
                            type="number"
                            value={stateRule.reportable_change ?? ""}
                            onChange={onReportNumberChange}
                            className="input validator w-48"
                            required
                        />
                    ) : (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">{t(($) => $.min_rep_change)}</legend>
                            <p className="label w-48">N/A</p>
                        </fieldset>
                    )}
                    <fieldset className="fieldset ml-auto">
                        <legend className="fieldset-legend">{t(($) => $.actions)}</legend>
                        <div className="join join-horizontal">
                            <Button<ReportingRule>
                                title={t(($) => $.apply, { ns: "common" })}
                                className="btn btn-square btn-primary btn-outline join-item"
                                item={stateRule}
                                onClick={onApply}
                                disabled={!isValidRule}
                            >
                                <FontAwesomeIcon icon={faCheck} />
                            </Button>
                            {!showOnlyApply && onSync !== undefined && !stateRule.isNew ? (
                                <ConfirmButton
                                    className="btn btn-square btn-outline btn-accent join-item"
                                    item={[sourceIdx, device.ieee_address, rule.endpoint, rule.cluster, rule.attribute]}
                                    onClick={onSync}
                                    title={t(($) => $.sync, { ns: "common" })}
                                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                                >
                                    <FontAwesomeIcon icon={faArrowsRotate} />
                                </ConfirmButton>
                            ) : null}
                            {/* {!showOnlyApply && !stateRule.isNew ? (
                            <ConfirmButton<void>
                                title={t(($) => $.default, { ns: "common" })}
                                className="btn btn-square btn-warning btn-outline join-item"
                                onClick={async () => {
                                    await onApply({ ...stateRule, minimum_report_interval: 0xffff, maximum_report_interval: 0x0000, reportable_change: 0 });
                                }}
                                modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                            >
                                <FontAwesomeIcon icon={faArrowRotateLeft} />
                            </ConfirmButton>
                        ) : null} */}
                            {!showOnlyApply && !stateRule.isNew ? (
                                <ConfirmButton<void>
                                    title={t(($) => $.disable, { ns: "common" })}
                                    className="btn btn-square btn-error btn-outline join-item"
                                    onClick={async () => {
                                        await onApply({ ...stateRule, maximum_report_interval: 0xffff, reportable_change: 0 });
                                    }}
                                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                                >
                                    <FontAwesomeIcon icon={faBan} />
                                </ConfirmButton>
                            ) : null}
                        </div>
                    </fieldset>
                </div>
                {showDivider ? <div className="divider my-0" /> : null}
            </>
        );
    },
);

export default ReportingRow;
