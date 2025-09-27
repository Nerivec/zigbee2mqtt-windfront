import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import InputField from "../../form-fields/InputField.js";
import Modal from "../Modal.js";

export type AddInstallCodeModalProps = {
    addInstallCode(code: string): Promise<void>;
};
export const AddInstallCodeModal = NiceModal.create((props: AddInstallCodeModalProps): JSX.Element => {
    const { addInstallCode } = props;
    const modal = useModal();
    const { t } = useTranslation(["settings", "common"]);
    const [code, setCode] = useState("");

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
            title={t(($) => $.add_install_code)}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t(($) => $.cancel, { ns: "common" })}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async () => {
                            if (code) {
                                modal.remove();
                                await addInstallCode(code);
                            }
                        }}
                    >
                        {t(($) => $.add_install_code)}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <InputField
                    name="install_code"
                    label={t(($) => $.install_code)}
                    onChange={(e) => setCode(e.target.value)}
                    value={code}
                    type="text"
                    required
                />
            </div>
        </Modal>
    );
});
