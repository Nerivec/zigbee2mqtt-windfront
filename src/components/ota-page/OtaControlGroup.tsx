import { faClock, faClockRotateLeft, faCloudArrowDown, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Device, DeviceState } from "../../types.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";

type OtaControlGroup = {
    sourceIdx: number;
    device: Device;
    state: DeviceState["update"];
    onCheckClick: ([sourceIdx, ieee]: [number, string]) => Promise<void>;
    onUpdateClick: ([sourceIdx, ieee]: [number, string]) => Promise<void>;
    onScheduleClick: ([sourceIdx, ieee]: [number, string]) => Promise<void>;
    onUnscheduleClick: ([sourceIdx, ieee]: [number, string]) => Promise<void>;
};

type UpdatingProps = {
    label: string;
    remaining: NonNullable<DeviceState["update"]>["remaining"];
    progress: NonNullable<DeviceState["update"]>["progress"];
};

const Updating = memo(({ label, remaining, progress }: UpdatingProps) => {
    if (remaining && remaining > 0) {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor(remaining / 60) % 60;
        const seconds = Math.floor(remaining % 60);
        const showHours = hours > 0;
        const showMinutes = minutes > 0;

        return (
            <>
                <progress className="progress w-48" value={progress} max="100" />
                <div>
                    {label} {showHours ? `${hours}:` : ""}
                    {showMinutes ? `${minutes.toString().padStart(2, "0")}:` : ""}
                    {seconds.toString().padStart(2, "0")}
                </div>
            </>
        );
    }

    return <progress className="progress w-48" value={progress} max="100" />;
});

const OtaControlGroup = memo(({ sourceIdx, device, state, onCheckClick, onUpdateClick, onScheduleClick, onUnscheduleClick }: OtaControlGroup) => {
    const { t } = useTranslation(["ota", "common"]);

    if (state == null || state.state === "idle") {
        return (
            <div className="join join-horizontal">
                <Button<[number, string]>
                    className="btn btn-square btn-outline btn-primary join-item"
                    onClick={onCheckClick}
                    item={[sourceIdx, device.ieee_address]}
                    title={t("check")}
                >
                    <FontAwesomeIcon icon={faCloudArrowDown} />
                </Button>
                <ConfirmButton<[number, string]>
                    className="btn btn-square btn-outline btn-info join-item"
                    onClick={onScheduleClick}
                    item={[sourceIdx, device.ieee_address]}
                    title={t("schedule")}
                    modalDescription={t("schedule_info")}
                    modalCancelLabel={t("common:cancel")}
                >
                    <FontAwesomeIcon icon={faClock} />
                </ConfirmButton>
            </div>
        );
    }

    if (state.state === "updating") {
        return <Updating label={t("remaining_time")} remaining={state.remaining} progress={state.progress} />;
    }

    return (
        <div className="join join-horizontal">
            {state.state === "available" ? (
                <>
                    <ConfirmButton<[number, string]>
                        className="btn btn-square btn-outline btn-error join-item"
                        onClick={onUpdateClick}
                        item={[sourceIdx, device.ieee_address]}
                        title={t("update")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        <FontAwesomeIcon icon={faUpload} />
                    </ConfirmButton>
                    <ConfirmButton<[number, string]>
                        className="btn btn-square btn-outline btn-info join-item"
                        onClick={onScheduleClick}
                        item={[sourceIdx, device.ieee_address]}
                        title={t("schedule")}
                        modalDescription={t("schedule_info")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </ConfirmButton>
                </>
            ) : state.state === "scheduled" ? (
                <ConfirmButton<[number, string]>
                    className="btn btn-square btn-outline btn-error join-item"
                    onClick={onUnscheduleClick}
                    item={[sourceIdx, device.ieee_address]}
                    title={t("unschedule")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                </ConfirmButton>
            ) : (
                <>
                    <Button<[number, string]>
                        className="btn btn-square btn-outline btn-primary join-item"
                        onClick={onCheckClick}
                        item={[sourceIdx, device.ieee_address]}
                        title={t("check")}
                    >
                        <FontAwesomeIcon icon={faCloudArrowDown} />
                    </Button>
                    <ConfirmButton<[number, string]>
                        className="btn btn-square btn-outline btn-info join-item"
                        onClick={onScheduleClick}
                        item={[sourceIdx, device.ieee_address]}
                        title={t("schedule")}
                        modalDescription={t("schedule_info")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </ConfirmButton>
                </>
            )}
        </div>
    );
});

export default OtaControlGroup;
