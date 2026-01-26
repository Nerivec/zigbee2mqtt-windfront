import { arrow, FloatingArrow, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { faClock, faClockRotateLeft, faClose, faCloudArrowDown, faCloudArrowUp, faTrashCan, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InterviewState } from "../../consts.js";
import type { AppState } from "../../store.js";
import type { Device, DeviceState } from "../../types.js";
import Button from "../Button.js";
import CheckboxField from "../form-fields/CheckboxField.js";
import InputField from "../form-fields/InputField.js";
import SelectField from "../form-fields/SelectField.js";
import {
    type OnCheckClickPayload,
    type OnScheduleClickPayload,
    type OnUnscheduleClickPayload,
    type OnUpdateClickPayload,
    type OtaImageHeader,
    readOtaFile,
} from "./index.js";
import OtaDataSettings, { type OtaDataSettingsProps } from "./OtaDataSettings.js";
import OtaFileVersion from "./OtaFileVersion.js";

type SourceType = "default" | "custom_index" | "custom_firmware";
type OtaAction = "check" | "update" | "schedule" | "unschedule";

export type OtaControlGroupProps = {
    sourceIdx: number;
    device: Device;
    state: DeviceState["update"];
    otaSettings: AppState["bridgeInfo"][number]["config"]["ota"];
    onCheckClick: (payload: OnCheckClickPayload) => Promise<void>;
    onUpdateClick: (payload: OnUpdateClickPayload) => Promise<void>;
    onScheduleClick: (payload: OnScheduleClickPayload) => Promise<void>;
    onUnscheduleClick: (payload: OnUnscheduleClickPayload) => Promise<void>;
};

const OtaControlGroup = memo(
    ({ sourceIdx, device, state, otaSettings, onCheckClick, onUpdateClick, onScheduleClick, onUnscheduleClick }: OtaControlGroupProps) => {
        const { t } = useTranslation(["ota", "common"]);
        const disableOta =
            device.interview_state === InterviewState.InProgress || device.interview_state === InterviewState.Pending || state?.state === "updating";
        const supportsOta = device.definition?.supports_ota;
        const isScheduled = state?.state === "scheduled";
        const sourceHexRef = useRef<HTMLInputElement>(null);
        const [sourceType, setSourceType] = useState<SourceType>(supportsOta ? "default" : "custom_index");
        const [sourceDowngrade, setSourceDowngrade] = useState<boolean>(false);
        const [sourceUrl, setSourceUrl] = useState<string | null>(null);
        const [sourceHex, setSourceHex] = useState<{ data: string; file_name?: string } | null>(null);
        const [sourceHexHeader, setSourceHexHeader] = useState<OtaImageHeader | null>(null);
        const [sourceHexError, setSourceHexError] = useState<string | null>(null);
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

        // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
        useEffect(() => {
            setSourceDowngrade(false);
            setSourceUrl(null);
            setSourceHex(null);
            setShowUpdateSettings(false);
        }, [sourceType]);

        const handleAction = useCallback(
            async (action: OtaAction) => {
                setIsOpen(false);

                switch (action) {
                    case "check": {
                        const payload: OnCheckClickPayload = { sourceIdx, ieee: device.ieee_address, downgrade: sourceDowngrade };

                        if (sourceUrl) {
                            payload.url = sourceUrl;
                        }

                        await onCheckClick(payload);
                        break;
                    }
                    case "update": {
                        const payload: OnUpdateClickPayload = { sourceIdx, ieee: device.ieee_address, downgrade: sourceDowngrade };

                        if (sourceUrl) {
                            payload.url = sourceUrl;
                        }

                        if (sourceHex) {
                            payload.hex = sourceHex;
                        }

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
                        const payload: OnScheduleClickPayload = { sourceIdx, ieee: device.ieee_address, downgrade: sourceDowngrade };

                        if (sourceUrl) {
                            payload.url = sourceUrl;
                        }

                        if (sourceHex) {
                            payload.hex = sourceHex;
                        }

                        await onScheduleClick(payload);
                        break;
                    }
                    case "unschedule": {
                        await onUnscheduleClick({ sourceIdx, ieee: device.ieee_address });
                        break;
                    }
                }
            },
            [
                sourceIdx,
                device.ieee_address,
                sourceUrl,
                sourceHex,
                sourceDowngrade,
                updateSettings,
                onCheckClick,
                onUpdateClick,
                onScheduleClick,
                onUnscheduleClick,
            ],
        );

        const disableCheck: boolean = useMemo(
            () => sourceType === "custom_firmware" || (sourceType === "custom_index" && (!sourceUrl || !/.+\.json$/.test(sourceUrl))),
            [sourceType, sourceUrl],
        );
        const disableUpdate: boolean = useMemo(
            () =>
                (sourceType === "custom_firmware" && ((!sourceHex && !sourceUrl) || (!!sourceHex && !!sourceUrl))) ||
                (sourceType === "custom_index" && (!sourceUrl || !/.+\.json$/.test(sourceUrl))),
            [sourceType, sourceHex, sourceUrl],
        );

        return (
            <>
                {isScheduled ? (
                    <Button<{ sourceIdx: number; ieee: string }>
                        className="btn btn-sm btn-square btn-outline btn-error join-item"
                        onClick={onUnscheduleClick}
                        item={{ sourceIdx, ieee: device.ieee_address }}
                        title={t(($) => $.unschedule)}
                    >
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                    </Button>
                ) : (
                    <button
                        ref={refs.setReference}
                        type="button"
                        className="btn btn-sm btn-square btn-outline btn-primary join-item tooltip tooltip-top"
                        {...getReferenceProps()}
                        data-tip="OTA"
                        disabled={disableOta}
                    >
                        <FontAwesomeIcon icon={faCloudArrowUp} />
                    </button>
                )}

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
                                <div className="flex flex-col gap-2 items-center">
                                    {state?.installed_version ? (
                                        <ul className="steps steps-horizontal w-full mb-2">
                                            <li className="step step-neutral" data-content="●">
                                                <OtaFileVersion version={state.installed_version} showRaw />
                                            </li>
                                        </ul>
                                    ) : null}
                                    {supportsOta ? null : <span className="text-base-content/65">{t(($) => $.no_official_ota_support)}</span>}
                                    <div className="flex flex-row flex-wrap gap-3 items-top">
                                        <SelectField
                                            name="source_type"
                                            label={t(($) => $.source)}
                                            onChange={(event) => {
                                                setSourceType(event.target.value as SourceType);
                                            }}
                                            value={sourceType}
                                        >
                                            {supportsOta ? <option value="default">{t(($) => $.default)}</option> : null}
                                            <option value="custom_index">{t(($) => $.custom_index)}</option>
                                            <option value="custom_firmware">{t(($) => $.custom_firmware)}</option>
                                        </SelectField>
                                        <CheckboxField
                                            name="source_downgrade"
                                            label={t(($) => $.downgrade)}
                                            onChange={(event) => setSourceDowngrade(event.target.checked)}
                                            checked={sourceDowngrade}
                                        />
                                        <CheckboxField
                                            name="show_update_settings"
                                            label={t(($) => $.show_update_settings)}
                                            checked={showUpdateSettings}
                                            onChange={(event) => setShowUpdateSettings(event.target.checked)}
                                        />
                                    </div>
                                    {sourceDowngrade ? <p>{t(($) => $.downgrade_notice)}</p> : null}
                                    {showUpdateSettings ? (
                                        <OtaDataSettings settings={updateSettings} setSettings={setUpdateSettings} defaultSettings={otaSettings} />
                                    ) : null}
                                    <div className="flex flex-col w-full items-center">
                                        {sourceType === "default" ? null : sourceType === "custom_index" ? (
                                            <InputField
                                                name="source_url"
                                                /** URL or file path */
                                                type="text"
                                                label={t(($) => $.source_url_index)}
                                                onChange={(event) => setSourceUrl(event.target.value ? event.target.value : null)}
                                                value={sourceUrl || ""}
                                                pattern=".+\.json$"
                                                required
                                            />
                                        ) : (
                                            <>
                                                <div className={`join join-horizontal items-center mt-2 ${sourceHex ? "w-full" : ""}`}>
                                                    <input
                                                        ref={sourceHexRef}
                                                        name="source_hex"
                                                        type="file"
                                                        accept="application/octet-stream,.zigbee,.ota,.bin"
                                                        className="file-input join-item flex-1"
                                                        onChange={async (event) => {
                                                            const file = event.target.files?.[0];

                                                            if (file) {
                                                                try {
                                                                    const [data, header] = await readOtaFile(file);

                                                                    setSourceHex({ data, file_name: file.name || undefined });
                                                                    setSourceHexHeader(header);

                                                                    if (state?.installed_version) {
                                                                        setSourceDowngrade(header.fileVersion < state.installed_version);
                                                                    }
                                                                } catch (error) {
                                                                    setSourceHex(null);
                                                                    setSourceHexHeader(null);
                                                                    setSourceHexError((error as Error).message);
                                                                }
                                                            }
                                                        }}
                                                        disabled={!!sourceUrl}
                                                    />
                                                    <Button<number>
                                                        item={sourceIdx}
                                                        onClick={() => {
                                                            setSourceHex(null);

                                                            if (sourceHexRef.current) {
                                                                sourceHexRef.current.value = "";
                                                            }
                                                        }}
                                                        className="btn btn-square btn-outline btn-warning btn-primary join-item"
                                                        disabled={!sourceHex}
                                                        title={t(($) => $.clear, { ns: "common" })}
                                                    >
                                                        <FontAwesomeIcon icon={faTrashCan} />
                                                    </Button>
                                                </div>
                                                {sourceHexHeader ? (
                                                    <ul className="steps steps-horizontal w-full mt-1">
                                                        <li className="step step-primary" data-content="★">
                                                            <OtaFileVersion version={sourceHexHeader.fileVersion} showRaw />
                                                        </li>
                                                    </ul>
                                                ) : sourceHexError ? (
                                                    <p>{sourceHexError}</p>
                                                ) : null}
                                                <div className="divider mb-1">OR</div>
                                                <InputField
                                                    name="source_url"
                                                    /** URL or file path */
                                                    type="text"
                                                    label={t(($) => $.source_url_firmware)}
                                                    onChange={(event) => setSourceUrl(event.target.value ? event.target.value : null)}
                                                    value={sourceUrl || ""}
                                                    readOnly={!!sourceHex}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="card-actions justify-end py-2">
                                    <Button
                                        className="btn btn-square btn-outline btn-primary join-item"
                                        onClick={handleAction}
                                        item="check"
                                        title={t(($) => $.check)}
                                        disabled={disableCheck}
                                    >
                                        <FontAwesomeIcon icon={faCloudArrowDown} />
                                    </Button>
                                    <Button
                                        className="btn btn-square btn-outline btn-error join-item"
                                        onClick={handleAction}
                                        item="update"
                                        title={t(($) => $.update)}
                                        disabled={disableUpdate}
                                    >
                                        <FontAwesomeIcon icon={faUpload} />
                                    </Button>
                                    <Button
                                        className="btn btn-square btn-outline btn-info join-item"
                                        onClick={handleAction}
                                        item="schedule"
                                        title={t(($) => $.schedule)}
                                        disabled={disableUpdate}
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
    },
);

export default OtaControlGroup;
