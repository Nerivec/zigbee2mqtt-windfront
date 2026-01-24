import { arrow, FloatingArrow, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { faClock, faClose, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InterviewState } from "../../consts.js";
import type { AppState } from "../../store.js";
import type { Device, DeviceState } from "../../types.js";
import Button from "../Button.js";
import CheckboxField from "../form-fields/CheckboxField.js";
import type { OnScheduleClickPayload, OnUpdateClickPayload } from "./index.js";
import OtaDataSettings, { type OtaDataSettingsProps } from "./OtaDataSettings.js";
import OtaFileVersion from "./OtaFileVersion.js";

export type OtaUpdateButtonProps = {
    sourceIdx: number;
    device: Device;
    state: DeviceState["update"] & {}; // not undefined
    otaSettings: AppState["bridgeInfo"][number]["config"]["ota"];
    onUpdateClick: (payload: OnUpdateClickPayload) => Promise<void>;
    onScheduleClick: (payload: OnScheduleClickPayload) => Promise<void>;
};

const OtaUpdateButton = memo(({ sourceIdx, device, state, otaSettings, onUpdateClick, onScheduleClick }: OtaUpdateButtonProps) => {
    const { t } = useTranslation(["ota", "common"]);
    const disableOta =
        device.interview_state === InterviewState.InProgress || device.interview_state === InterviewState.Pending || state.state === "updating";
    const [showUpdateSettings, setShowUpdateSettings] = useState<boolean>(false);
    const [updateSettings, setUpdateSettings] = useState<OtaDataSettingsProps["settings"]>({});
    const arrowRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: "bottom-end",
        middleware: [offset(8), shift({ padding: 16, crossAxis: true }), arrow({ element: arrowRef })],
        strategy: "fixed",
        transform: false,
    });
    const click = useClick(context, { event: "click" });
    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    /**
     * Here, we have an update available from a previous "check", which could have used a specific source index,
     * hence always use `state.latest_source` for `url` (otherwise it would re-do a check with the default URL).
     * This has the benefit of failing on Z2M side if the previous "check" was stale and the URL no longer is valid (e.g. file updated in a repo),
     * instead of "magically" using the new URL without the user's knowledge (since we clearly display the source).
     * This behavior is different from `OtaControlGroup` which retains the pre 2.7.0 behavior.
     */
    const handleAction = useCallback(
        async (action: "update" | "schedule") => {
            if (state.latest_version && state.installed_version && state.latest_source) {
                setIsOpen(false);

                const downgrade = state.latest_version < state.installed_version;

                switch (action) {
                    case "update": {
                        const payload: OnUpdateClickPayload = {
                            sourceIdx,
                            ieee: device.ieee_address,
                            downgrade,
                            url: state.latest_source,
                        };

                        if (updateSettings.image_block_request_timeout) {
                            payload.image_block_request_timeout = updateSettings.image_block_request_timeout;
                        }

                        if (updateSettings.image_block_response_delay) {
                            payload.image_block_response_delay = updateSettings.image_block_response_delay;
                        }

                        if (updateSettings.default_maximum_data_size) {
                            payload.default_maximum_data_size = updateSettings.default_maximum_data_size;
                        }

                        await onUpdateClick(payload);

                        break;
                    }
                    case "schedule": {
                        await onScheduleClick({
                            sourceIdx,
                            ieee: device.ieee_address,
                            downgrade,
                            url: state.latest_source,
                        });
                        break;
                    }
                }
            }
        },
        [sourceIdx, device.ieee_address, updateSettings, state, onUpdateClick, onScheduleClick],
    );

    return (
        <>
            <button
                ref={refs.setReference}
                type="button"
                className={`btn btn-sm btn-square btn-outline ${state.latest_version! > state.installed_version! ? "btn-accent" : "btn-error"} join-item tooltip tooltip-top`}
                {...getReferenceProps()}
                data-tip={t(($) => $.update)}
                disabled={disableOta}
            >
                <FontAwesomeIcon icon={faUpload} />
            </button>
            {isOpen ? (
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
                                <h4 className="card-title">OTA: {device.friendly_name}</h4>
                                <Button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-square">
                                    <FontAwesomeIcon icon={faClose} />
                                </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col w-full gap-2">
                                    <ul className="steps steps-horizontal w-full mb-2">
                                        {state.latest_version! > state.installed_version! ? (
                                            <>
                                                <li className="step step-neutral" data-content="●">
                                                    <OtaFileVersion version={state.installed_version} showRaw />
                                                </li>
                                                <li className="step step-accent" data-content="★">
                                                    <OtaFileVersion version={state.latest_version} showRaw />
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="step step-error" data-content="★">
                                                    <OtaFileVersion version={state.latest_version} showRaw />
                                                </li>
                                                <li className="step step-neutral" data-content="●">
                                                    <OtaFileVersion version={state.installed_version} showRaw />
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                    <p>{t(($) => $.source)}: </p>
                                    <div className="wrap-anywhere">
                                        <p className="text-base-content/65">{state.latest_source}</p>
                                    </div>
                                    <p>{t(($) => $.release_notes)}: </p>
                                    <div className="wrap-anywhere">
                                        <p className="text-base-content/65">{state.latest_release_notes ?? "N/A"}</p>
                                    </div>
                                </div>
                                <CheckboxField
                                    name="show_update_settings"
                                    label={t(($) => $.show_update_settings)}
                                    checked={showUpdateSettings}
                                    onChange={(event) => setShowUpdateSettings(event.target.checked)}
                                />
                                {showUpdateSettings ? (
                                    <OtaDataSettings settings={updateSettings} setSettings={setUpdateSettings} defaultSettings={otaSettings} />
                                ) : null}
                            </div>
                            <div className="card-actions justify-end py-2">
                                <Button
                                    className="btn btn-square btn-outline btn-error join-item"
                                    onClick={handleAction}
                                    item="update"
                                    title={t(($) => $.update)}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                </Button>
                                <Button
                                    className="btn btn-square btn-outline btn-info join-item"
                                    onClick={handleAction}
                                    item="schedule"
                                    title={t(($) => $.schedule)}
                                >
                                    <FontAwesomeIcon icon={faClock} />
                                </Button>
                            </div>
                        </div>
                        <FloatingArrow
                            ref={arrowRef}
                            context={context}
                            className="fill-base-200 [&>path:first-of-type]:stroke-base-300 [&>path:last-of-type]:stroke-base-300"
                        />
                    </aside>
                </FloatingPortal>
            ) : null}
        </>
    );
});

export default OtaUpdateButton;
