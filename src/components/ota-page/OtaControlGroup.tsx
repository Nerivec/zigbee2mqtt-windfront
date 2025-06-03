import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Device, DeviceState } from "../../types.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";

type OtaControlGroup = {
    device: Device;
    state: DeviceState["update"];
    onCheckClick: (ieee: string) => Promise<void>;
    onUpdateClick: (ieee: string) => Promise<void>;
    onScheduleClick: (ieee: string) => Promise<void>;
    onUnscheduleClick: (ieee: string) => Promise<void>;
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
                    {label} {`${showHours ? `${hours}:` : ""}${showMinutes ? `${minutes}:` : ""}${seconds}`}
                </div>
            </>
        );
    }

    return <progress className="progress w-48" value={progress} max="100" />;
});

const OtaControlGroup = memo((props: OtaControlGroup) => {
    const { t } = useTranslation(["ota", "common"]);
    const { device, state, onCheckClick, onUpdateClick, onScheduleClick, onUnscheduleClick } = props;

    if (state == null || state.state === "idle") {
        return (
            <div className="join join-horizontal">
                <Button<string> className="btn btn-primary btn-sm join-item" onClick={onCheckClick} item={device.ieee_address}>
                    {t("check")}
                </Button>
                <ConfirmButton<string>
                    className="btn btn-info btn-sm join-item"
                    onClick={onScheduleClick}
                    item={device.ieee_address}
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
                    <ConfirmButton<string>
                        className="btn btn-error btn-sm join-item"
                        onClick={onUpdateClick}
                        item={device.ieee_address}
                        title={t("update")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        {t("update")}
                    </ConfirmButton>
                    <ConfirmButton<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={onScheduleClick}
                        item={device.ieee_address}
                        title={t("schedule")}
                        modalDescription={t("schedule_info")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </ConfirmButton>
                </>
            ) : state.state === "scheduled" ? (
                <ConfirmButton<string>
                    className="btn btn-sm btn-error join-item"
                    onClick={onUnscheduleClick}
                    item={device.ieee_address}
                    title={t("unschedule")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("unschedule")}
                </ConfirmButton>
            ) : (
                <>
                    <Button<string> className="btn btn-primary btn-sm join-item" onClick={onCheckClick} item={device.ieee_address}>
                        {t("check")}
                    </Button>
                    <ConfirmButton<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={onScheduleClick}
                        item={device.ieee_address}
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
