import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import InputField from "../../form-fields/InputField.js";
import Modal from "../Modal.js";

type RenameGroupFormProps = {
    sourceIdx: number;
    name: string;
    onRename(sourceIdx: number, oldName: string, newName: string): Promise<void>;
};

export const RenameGroupForm = NiceModal.create(({ sourceIdx, name, onRename }: RenameGroupFormProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["groups", "common"]);
    const [friendlyName, setFriendlyName] = useState(name);

    useEffect(() => {
        setFriendlyName(name);
    }, [name]);

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
            title={`${t(($) => $.rename_group)} ${name}`}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t(($) => $.cancel, { ns: "common" })}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async (): Promise<void> => {
                            if (friendlyName) {
                                modal.remove();
                                await onRename(sourceIdx, name, friendlyName);
                            }
                        }}
                    >
                        {t(($) => $.rename_group)}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <InputField
                    name="friendly_name"
                    label={t(($) => $.friendly_name, { ns: "common" })}
                    onChange={(e) => setFriendlyName(e.target.value)}
                    value={friendlyName}
                    type="text"
                    required
                />
            </div>
        </Modal>
    );
});
