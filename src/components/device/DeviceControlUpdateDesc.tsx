import NiceModal from "@ebay/nice-modal-react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../types.js";
import Button from "../Button.js";
import { UpdateDeviceDescModal } from "../modal/components/EditDeviceDescModal.js";

interface DeviceControlUpdateDescProps {
    device: Device;
    setDeviceDescription(old: string, newDesc: string): Promise<void>;
}

const DeviceControlUpdateDesc = memo(({ device, setDeviceDescription }: DeviceControlUpdateDescProps) => {
    const { t } = useTranslation("zigbee");

    return (
        <Button<void>
            className={`btn btn-link btn-sm${device.description ? " btn-square" : ""}`}
            onClick={async () =>
                await NiceModal.show(UpdateDeviceDescModal, {
                    device,
                    setDeviceDescription,
                })
            }
            title={t(($) => $.edit_description)}
        >
            {device.description ? <FontAwesomeIcon icon={faEdit} /> : t(($) => $.edit_description)}
        </Button>
    );
});

export default DeviceControlUpdateDesc;
