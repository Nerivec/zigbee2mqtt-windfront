import { arrow, FloatingArrow, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { faClose, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import Button from "../../Button.js";
import { aggregateReporting, makeDefaultReporting, type ReportingEndpoint, type ReportingRule } from "../../reporting/index.js";
import ReportingRow from "../ReportingRow.js";

interface ReportingProps {
    sourceIdx: number;
    device: Device;
}

interface ReportingEndpointSectionProps extends ReportingEndpoint {
    device: Device;
    sourceIdx: number;
    onApply(rule: ReportingRule): Promise<void>;
}

const getRuleKey = (rule: ReportingRule): string =>
    `${rule.endpoint}-${rule.cluster}-${rule.attribute}-${rule.minimum_report_interval}-${rule.maximum_report_interval}`;

const ReportingEndpointSection = memo(({ endpointId, rules, device, sourceIdx, onApply }: ReportingEndpointSectionProps) => {
    const { t } = useTranslation(["zigbee", "common"]);
    const arrowRef = useRef(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [draftRule, setDraftRule] = useState<ReportingRule | null>(null);
    const { refs, floatingStyles, context } = useFloating({
        open: isAddOpen,
        onOpenChange: setIsAddOpen,
        placement: "bottom-end",
        middleware: [offset(8), shift({ padding: 16 }), arrow({ element: arrowRef })],
    });
    const click = useClick(context, { event: "click" });
    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    useEffect(() => {
        if (isAddOpen) {
            setDraftRule(makeDefaultReporting(device.ieee_address, endpointId));
        } else {
            setDraftRule(null);
        }
    }, [isAddOpen, device.ieee_address, endpointId]);

    const handleApply = useCallback(
        async (rule: ReportingRule): Promise<void> => {
            await onApply(rule);

            if (rule.isNew) {
                setIsAddOpen(false);
            }
        },
        [onApply],
    );

    return (
        <section className="card bg-base-200 shadow-sm">
            <div className="card-body p-3">
                <div className="card-title flex flex-wrap gap-2 items-center justify-between">
                    {t(($) => $.endpoint)} {endpointId}
                    <button ref={refs.setReference} type="button" className="btn btn-primary btn-outline btn-sm" {...getReferenceProps()}>
                        <FontAwesomeIcon icon={faPlus} />
                        <span>{t(($) => $.add, { ns: "common" })}</span>
                    </button>
                </div>

                {rules.length > 0 ? (
                    rules.map((rule, index) => (
                        <ReportingRow
                            key={getRuleKey(rule)}
                            sourceIdx={sourceIdx}
                            rule={rule}
                            device={device}
                            onApply={handleApply}
                            showDivider={index < rules.length - 1}
                        />
                    ))
                ) : (
                    <p className="text-sm opacity-70">{t(($) => $.none, { ns: "common" })}</p>
                )}

                {isAddOpen && draftRule ? (
                    <FloatingPortal>
                        <aside
                            ref={refs.setFloating}
                            style={floatingStyles}
                            {...getFloatingProps({
                                className: "card bg-base-200 shadow-lg border border-base-300 w-[min(32rem,calc(100vw-2.5rem))] max-h-[80vh] z-11",
                            })}
                        >
                            <div className="card-body p-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="card-title">{t(($) => $.add, { ns: "common" })}</h4>
                                    <Button onClick={() => setIsAddOpen(false)} className="btn btn-ghost btn-sm">
                                        <FontAwesomeIcon icon={faClose} />
                                    </Button>
                                </div>
                                <ReportingRow sourceIdx={sourceIdx} rule={draftRule} device={device} onApply={handleApply} showDivider={false} />
                            </div>
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                className="fill-base-200 [&>path:first-of-type]:stroke-base-300 [&>path:last-of-type]:stroke-base-300"
                            />
                        </aside>
                    </FloatingPortal>
                ) : null}
            </div>
        </section>
    );
});

export default function Reporting({ sourceIdx, device }: ReportingProps): JSX.Element {
    const reportingsByEndpoints = useMemo(() => aggregateReporting(device), [device]);

    const onApply = useCallback(
        async (rule: ReportingRule): Promise<void> => {
            const { cluster, endpoint, attribute, minimum_report_interval, maximum_report_interval, reportable_change } = rule;

            await sendMessage(sourceIdx, "bridge/request/device/configure_reporting", {
                id: device.ieee_address,
                endpoint,
                cluster,
                attribute,
                minimum_report_interval,
                maximum_report_interval,
                reportable_change,
                option: {}, // TODO: check this
            });
        },
        [sourceIdx, device.ieee_address],
    );

    return (
        <div className="flex flex-col w-full gap-3">
            {reportingsByEndpoints.map((reportings) => (
                <ReportingEndpointSection key={reportings.endpointId} {...reportings} device={device} sourceIdx={sourceIdx} onApply={onApply} />
            ))}
        </div>
    );
}
