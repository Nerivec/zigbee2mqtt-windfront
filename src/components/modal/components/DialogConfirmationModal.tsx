import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useCallback, useEffect } from "react";
import Button from "../../Button.js";
import Modal from "../Modal.js";

export type DialogConfirmationModalProps = {
    onConfirmHandler(): Promise<void>;
    modalTitle: string;
    modalDescription: string;
    modalCancelLabel: string;
    modalConfirmLabel?: string;
};

export const DialogConfirmationModal = NiceModal.create((props: DialogConfirmationModalProps): JSX.Element => {
    const { onConfirmHandler, modalTitle, modalDescription, modalCancelLabel, modalConfirmLabel } = props;
    const modal = useModal();

    const onConfirm = useCallback(async () => {
        modal.remove();
        await onConfirmHandler();
    }, [modal, onConfirmHandler]);

    useEffect(() => {
        const close = async (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                modal.remove();
            } else if (e.key === "Enter") {
                e.preventDefault();
                await onConfirm();
            }
        };

        window.addEventListener("keydown", close);

        return () => window.removeEventListener("keydown", close);
    }, [modal, onConfirm]);

    return (
        <Modal
            isOpen={modal.visible}
            title={modalTitle}
            footer={
                <>
                    <Button className="btn btn-neutral" onClick={modal.remove}>
                        {modalCancelLabel}
                    </Button>
                    <Button className="btn btn-primary ms-1" onClick={onConfirm}>
                        {modalConfirmLabel || modalTitle}
                    </Button>
                </>
            }
        >
            <div className="flex flex-row justify-center items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-error" />
                {modalDescription}
            </div>
        </Modal>
    );
});
