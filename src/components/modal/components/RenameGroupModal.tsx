import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import InputField from "../../form-fields/InputField.js";
import Modal from "../Modal.js";

type RenameGroupFormProps = {
    name: string;
    onRename(oldName: string, newName: string): Promise<void>;
};

export const RenameGroupForm = NiceModal.create((props: RenameGroupFormProps): JSX.Element => {
    const { name, onRename } = props;
    const modal = useModal();
    const { t } = useTranslation(["groups", "common"]);
    const [friendlyName, setFriendlyName] = useState(name);

    useEffect(() => {
        setFriendlyName(name);
    }, [name]);

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t("rename_group")} ${name}`}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t("common:cancel")}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async (): Promise<void> => {
                            if (friendlyName) {
                                modal.remove();
                                await onRename(name, friendlyName);
                            }
                        }}
                    >
                        {t("rename_group")}
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
                    required
                />
            </div>
        </Modal>
    );
});
