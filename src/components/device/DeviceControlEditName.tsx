import NiceModal from "@ebay/nice-modal-react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button.js";
import { RenameDeviceModal } from "../modal/components/RenameDeviceModal.js";

interface DeviceControlEditNameProps {
    sourceIdx: number;
    name: string;
    homeassistantEnabled: boolean;
    style: string;
    renameDevice(sourceIdx: number, old: string, newName: string, homeassistantRename: boolean): Promise<void>;
}

const DeviceControlEditName = memo(({ sourceIdx, name, homeassistantEnabled, style, renameDevice }: DeviceControlEditNameProps) => {
    const { t } = useTranslation("zigbee");

    return (
        <Button<undefined>
            className={`btn ${style}`}
            onClick={async () =>
                await NiceModal.show(RenameDeviceModal, {
                    sourceIdx,
                    name,
                    renameDevice,
                    homeassistantEnabled,
                })
            }
            title={t("rename_device")}
        >
            <FontAwesomeIcon icon={faEdit} />
        </Button>
    );
});

export default DeviceControlEditName;
