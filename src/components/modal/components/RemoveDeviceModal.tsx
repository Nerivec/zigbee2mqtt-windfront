import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type ChangeEvent, type JSX, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../../types.js";
import Button from "../../Button.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import Modal from "../Modal.js";

type DeviceRemovalButtonProps = {
    sourceIdx: number;
    device: Device;
    removeDevice(sourceIdx: number, ieee: string, force: boolean, block: boolean): Promise<void>;
};

export const RemoveDeviceModal = NiceModal.create(({ sourceIdx, device, removeDevice }: DeviceRemovalButtonProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common"]);
    const [removeParams, setRemoveParams] = useState({ block: false, force: false });

    const onDeviceRemovalParamChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
        const { checked, name } = e.target;

        setRemoveParams((prev) => ({ ...prev, ...{ [name]: checked } }));
    }, []);

    const onRemoveClick = useCallback(async () => {
        modal.remove();
        await removeDevice(sourceIdx, device.ieee_address, removeParams.force, removeParams.block);
    }, [sourceIdx, modal.remove, removeDevice, device.ieee_address, removeParams]);

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
            title={`${t("remove_device")} ${device.friendly_name}`}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t("common:cancel")}
                    </Button>
                    <Button className="btn btn-error ms-1" onClick={onRemoveClick}>
                        {t("common:delete")}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <CheckboxField label={t("force_remove")} name="force" onChange={onDeviceRemovalParamChange} checked={removeParams.force} />
                <span className="text-xs opacity-50">{t("force_remove_notice")}</span>
                <CheckboxField label={t("block_join")} name="block" onChange={onDeviceRemovalParamChange} checked={removeParams.block} />
            </div>
        </Modal>
    );
});
