import NiceModal from "@ebay/nice-modal-react";
import { faInfo, faRetweet, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { InterviewState } from "../../consts.js";
import type { Device, DeviceState } from "../../types.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";
import { RemoveDeviceModal } from "../modal/components/RemoveDeviceModal.js";
import DeviceControlEditName from "./DeviceControlEditName.js";

interface DeviceControlGroupProps {
    device: Device;
    otaState?: NonNullable<DeviceState["update"]>["state"];
    homeassistantEnabled: boolean;
    renameDevice: (from: string, to: string, homeassistantRename: boolean) => Promise<void>;
    configureDevice: (id: string) => Promise<void>;
    interviewDevice: (id: string) => Promise<void>;
    removeDevice: (id: string, force: boolean, block: boolean) => Promise<void>;
}

export default function DeviceControlGroup(props: DeviceControlGroupProps): JSX.Element {
    const { device, otaState, renameDevice, configureDevice, interviewDevice, removeDevice } = props;
    const { t } = useTranslation(["zigbee", "common"]);
    const disableInterview =
        device.interview_state === InterviewState.InProgress || device.interview_state === InterviewState.Pending || otaState === "updating";

    return (
        <div className="join join-horizontal">
            <DeviceControlEditName
                name={device.friendly_name}
                renameDevice={renameDevice}
                homeassistantEnabled={props.homeassistantEnabled}
                style="btn-outline btn-primary join-item btn-square"
            />
            <ConfirmButton<string>
                className="btn btn-outline btn-warning join-item btn-square"
                onClick={configureDevice}
                item={device.ieee_address}
                title={t("reconfigure")}
                modalDescription={t("common:dialog_confirmation_prompt")}
                modalCancelLabel={t("common:cancel")}
                disabled={disableInterview}
            >
                <FontAwesomeIcon icon={faRetweet} />
            </ConfirmButton>
            <ConfirmButton<string>
                className="btn btn-outline btn-info join-item btn-square"
                onClick={interviewDevice}
                item={device.ieee_address}
                title={t("interview")}
                modalDescription={t("common:dialog_confirmation_prompt")}
                modalCancelLabel={t("common:cancel")}
                disabled={disableInterview}
            >
                <FontAwesomeIcon icon={faInfo} />
            </ConfirmButton>
            <Button<void>
                onClick={async () => await NiceModal.show(RemoveDeviceModal, { device, removeDevice })}
                className="btn btn-outline btn-error join-item btn-square"
                title={t("remove_device")}
            >
                <FontAwesomeIcon icon={faTrash} />
            </Button>
        </div>
    );
}
