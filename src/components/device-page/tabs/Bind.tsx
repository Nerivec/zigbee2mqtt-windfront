import { arrow, FloatingArrow, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { faClose, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { type AppState, useAppStore } from "../../../store.js";
import type { Device, Group } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import Button from "../../Button.js";
import {
    type Action,
    aggregateBindingsByEndpoints,
    type BindingEndpoint,
    type BindingRule,
    getRuleDst,
    makeDefaultBinding,
} from "../../binding/index.js";
import ConfirmButton from "../../ConfirmButton.js";
import BindRow from "../BindRow.js";

interface BindProps {
    sourceIdx: number;
    device: Device;
}

interface BindingEndpointSectionProps extends BindingEndpoint {
    devices: AppState["devices"][number];
    groups: Group[];
    sourceIdx: number;
    device: Device;
    onApply(args: [Action, BindingRule]): Promise<void>;
}

const getRuleKey = (rule: BindingRule): string =>
    `${rule.isNew}-${rule.source.endpoint}-${rule.source.ieee_address}-${"ieee_address" in rule.target ? rule.target.ieee_address : rule.target.id}-${rule.clusters.join("-")}`;

const BindingEndpointSection = memo(({ endpointId, rules, devices, groups, sourceIdx, device, onApply }: BindingEndpointSectionProps) => {
    const { t } = useTranslation(["common", "zigbee", "scene"]);
    const arrowRef = useRef(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [draftRule, setDraftRule] = useState<BindingRule | null>(null);
    const { refs, floatingStyles, context } = useFloating({
        open: isAddOpen,
        onOpenChange: setIsAddOpen,
        placement: "bottom-end",
        middleware: [offset(8), shift({ padding: 16, crossAxis: true }), arrow({ element: arrowRef })],
        strategy: "fixed",
        transform: false,
    });
    const click = useClick(context, { event: "click" });
    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    useEffect(() => {
        if (isAddOpen) {
            setDraftRule(makeDefaultBinding(device.ieee_address, endpointId));
        } else {
            setDraftRule(null);
        }
    }, [isAddOpen, device.ieee_address, endpointId]);

    const handleApply = useCallback(
        async ([action, rule]: [Action, BindingRule]): Promise<void> => {
            await onApply([action, rule]);

            if (rule.isNew) {
                setIsAddOpen(false);
            }
        },
        [onApply],
    );

    return (
        <section className="card bg-base-200 card-border border-base-200 shadow-sm">
            <div className="card-body p-3">
                <div className="card-title flex flex-wrap gap-2 items-center justify-between">
                    {t(($) => $.source_endpoint, { ns: "common" })} {endpointId}
                    <button ref={refs.setReference} type="button" className="btn btn-primary btn-outline btn-sm" {...getReferenceProps()}>
                        <FontAwesomeIcon icon={faPlus} />
                        <span>{t(($) => $.add, { ns: "common" })}</span>
                    </button>
                </div>

                {rules.length > 0 ? (
                    rules.map((rule, index) => (
                        <BindRow
                            key={getRuleKey(rule)}
                            rule={rule}
                            sourceIdx={sourceIdx}
                            groups={groups}
                            device={device}
                            devices={devices}
                            showDivider={index < rules.length - 1}
                            onApply={handleApply}
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
                            <div className="card-body py-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="card-title">
                                        {t(($) => $.add, { ns: "common" })}: {t(($) => $.source_endpoint, { ns: "common" })} {endpointId}
                                    </h4>
                                    <Button onClick={() => setIsAddOpen(false)} className="btn btn-ghost btn-square">
                                        <FontAwesomeIcon icon={faClose} />
                                    </Button>
                                </div>
                                <BindRow
                                    rule={draftRule}
                                    sourceIdx={sourceIdx}
                                    groups={groups}
                                    device={device}
                                    devices={devices}
                                    showDivider={false}
                                    onApply={handleApply}
                                />
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

export default function Bind({ sourceIdx, device }: BindProps): JSX.Element {
    const { t } = useTranslation("common");
    const devices = useAppStore(useShallow((state) => state.devices[sourceIdx]));
    const groups = useAppStore(useShallow((state) => state.groups[sourceIdx]));
    const bindingsByEndpoints = useMemo(() => aggregateBindingsByEndpoints(device), [device]);

    const onBindOrUnBindClick = useCallback(
        async ([action, stateRule]: [Action, BindingRule]): Promise<void> => {
            const dst = getRuleDst(stateRule.target, devices, groups);

            if (!dst) {
                return;
            }

            const bindParams = {
                from: device.ieee_address,
                from_endpoint: stateRule.source.endpoint,
                to: dst.to,
                to_endpoint: dst.toEndpoint,
                clusters: stateRule.clusters,
            };

            if (action === "Bind") {
                await sendMessage(sourceIdx, "bridge/request/device/bind", bindParams);
            } else {
                await sendMessage(sourceIdx, "bridge/request/device/unbind", bindParams);
            }
        },
        [sourceIdx, device, devices, groups],
    );

    const onClear = useCallback(async ([sourceIdx, target, ieeeList]: [number, string, `0x${string}`[]]) => {
        await sendMessage(sourceIdx, "bridge/request/device/binds/clear", { target, ieee_list: ieeeList });
    }, []);

    return (
        <div className="flex flex-col w-full gap-3">
            <div className="flex flex-row flex-wrap gap-3">
                <ConfirmButton
                    className="btn btn-outline btn-error join-item"
                    item={[sourceIdx, device.ieee_address, [device.ieee_address]]}
                    onClick={onClear}
                    title={t(($) => $.clear_self_as_source)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                >
                    <FontAwesomeIcon icon={faTrashCan} />
                    {t(($) => $.clear_self_as_source)}
                </ConfirmButton>
                <ConfirmButton
                    className="btn btn-outline btn-error join-item"
                    item={[sourceIdx, device.ieee_address, ["0xffffffffffffffff"]]}
                    onClick={onClear}
                    title={t(($) => $.clear_all)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                >
                    <FontAwesomeIcon icon={faTrashCan} />
                    {t(($) => $.clear_all)}
                </ConfirmButton>
            </div>
            {bindingsByEndpoints.map((bindings) => (
                <BindingEndpointSection
                    key={bindings.endpointId}
                    {...bindings}
                    devices={devices}
                    groups={groups}
                    sourceIdx={sourceIdx}
                    device={device}
                    onApply={onBindOrUnBindClick}
                />
            ))}
        </div>
    );
}
