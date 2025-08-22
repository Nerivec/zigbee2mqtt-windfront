import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type JSX, type PropsWithChildren, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import Modal from "../Modal.js";

export type SearchModalProps = {
    search: () => void;
} & PropsWithChildren;

export const SearchModal = NiceModal.create(({ children, search }: SearchModalProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation("common");

    useEffect(() => {
        const close = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                modal.remove();
            } else if (e.key === "Enter") {
                e.preventDefault();
                search();
            }
        };

        window.addEventListener("keydown", close);

        return () => window.removeEventListener("keydown", close);
    }, [modal, search]);

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t("search")} ${name}`}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {t("common:cancel")}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={() => {
                            modal.remove();
                            search();
                        }}
                    >
                        {t("search")}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">{children}</div>
        </Modal>
    );
});
