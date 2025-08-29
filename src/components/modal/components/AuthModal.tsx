import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import Modal from "../Modal.js";

type AuthModalProps = {
    onAuth(token: string): void;
};

export const AuthModal = NiceModal.create((props: AuthModalProps): JSX.Element => {
    const { onAuth } = props;

    const modal = useModal();
    const { t } = useTranslation("common");
    const [token, setToken] = useState("");

    const onLoginClick = useCallback((): void => {
        if (token) {
            modal.remove();
            onAuth(token);
        }
    }, [token, modal.remove, onAuth]);

    return (
        <Modal
            isOpen={modal.visible}
            title={t("enter_auth_token")}
            footer={
                <Button className="btn btn-primary" onClick={onLoginClick}>
                    {t("ok")}
                </Button>
            }
        >
            <input
                name="token"
                type="password"
                className="input validator grow"
                autoCapitalize="none"
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e): void => {
                    if (e.key === "Enter" && !(e.target as HTMLInputElement).validationMessage) {
                        onLoginClick();
                    }
                }}
                required
            />
        </Modal>
    );
});
