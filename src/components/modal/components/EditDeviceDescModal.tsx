import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../../types.js";
import Button from "../../Button.js";
import TextareaField from "../../form-fields/TextareaField.js";
import Modal from "../Modal.js";

export type RenameActionProps = {
    device: Device;
    setDeviceDescription(friendlyName: string, description: string): Promise<void>;
};

export const UpdateDeviceDescModal = NiceModal.create(({ device, setDeviceDescription }: RenameActionProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common"]);
    const [description, setDescription] = useState(device.description || "");

    useEffect(() => {
        setDescription(device.description || "");
    }, [device.description]);

    useEffect(() => {
        const close = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                modal.remove();
            }
        };

        window.addEventListener("keydown", close);

        return () => window.removeEventListener("keydown", close);
    }, [modal]);

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t(($) => $.update_description)} ${device.friendly_name}`}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t(($) => $.cancel, { ns: "common" })}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async () => {
                            modal.remove();
                            await setDeviceDescription(device.ieee_address, description);
                        }}
                    >
                        {t(($) => $.save_description)}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <TextareaField
                    label={t(($) => $.description)}
                    name="update_description"
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    value={description}
                />
            </div>
        </Modal>
    );
});
