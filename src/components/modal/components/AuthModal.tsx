import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import Modal from "../Modal.js";

type AuthFormProps = {
    onAuth(token: string): Promise<void>;
};

export const AuthForm = NiceModal.create((props: AuthFormProps): JSX.Element => {
    const { onAuth } = props;

    const modal = useModal();
    const { t } = useTranslation("common");
    const [token, setToken] = useState("");

    const onLoginClick = useCallback(async (): Promise<void> => {
        if (token) {
            modal.remove();
            await onAuth(token);
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
            <label className="input">
                {t("token")}
                <input
                    name="token"
                    type="password"
                    className="grow"
                    autoCapitalize="none"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e): void => {
                        if (e.key === "Enter" && !(e.target as HTMLInputElement).validationMessage) {
                            onLoginClick();
                        }
                    }}
                    required
                />
            </label>
        </Modal>
    );
});
