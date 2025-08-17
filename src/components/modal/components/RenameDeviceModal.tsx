import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import InputField from "../../form-fields/InputField.js";
import Modal from "../Modal.js";

export type RenameActionProps = {
    sourceIdx: number;
    name: string;
    homeassistantEnabled: boolean;
    renameDevice(sourceIdx: number, old: string, newName: string, homeassistantRename: boolean): Promise<void>;
};
export const RenameDeviceModal = NiceModal.create(({ sourceIdx, homeassistantEnabled, name, renameDevice }: RenameActionProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common"]);
    const [isHASSRename, setIsHASSRename] = useState(false);
    const [friendlyName, setFriendlyName] = useState(name);

    useEffect(() => {
        setFriendlyName(name);
    }, [name]);

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t("rename_device")} ${name}`}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t("common:cancel")}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async () => {
                            modal.remove();
                            await renameDevice(sourceIdx, name, friendlyName, isHASSRename);
                        }}
                    >
                        {t("rename_device")}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <InputField
                    name="friendly_name"
                    label={t("common:friendly_name")}
                    onChange={(e) => setFriendlyName(e.target.value)}
                    value={friendlyName}
                    type="text"
                />
                {homeassistantEnabled && (
                    <CheckboxField
                        label={t("update_Home_assistant_entity_id")}
                        name="update_Home_assistant_entity_id"
                        onChange={(e) => setIsHASSRename(e.target.checked)}
                        checked={isHASSRename}
                    />
                )}
            </div>
        </Modal>
    );
});
