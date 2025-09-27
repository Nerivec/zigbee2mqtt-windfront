import NiceModal from "@ebay/nice-modal-react";
import { type ButtonHTMLAttributes, type JSX, useCallback } from "react";
import { DialogConfirmationModal, type DialogConfirmationModalProps } from "./modal/components/DialogConfirmationModal.js";

interface ConfirmButtonProps<T>
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">,
        Omit<DialogConfirmationModalProps, "onConfirmHandler" | "modalTitle"> {
    title: string;
    item?: T;
    onClick?(entity: T): Promise<void> | void;
}

export default function ConfirmButton<T>(props: ConfirmButtonProps<T>): JSX.Element {
    const { children, item, onClick, modalDescription, modalCancelLabel, title, className, ...rest } = props;

    const onClickHandler = useCallback(async (): Promise<void> => {
        await NiceModal.show(DialogConfirmationModal, {
            onConfirmHandler: async () => await onClick?.(item as T),
            modalTitle: title,
            modalDescription,
            modalCancelLabel,
            modalConfirmLabel: title,
        });
    }, [item, onClick, title, modalDescription, modalCancelLabel]);

    return (
        <button type="button" className={`${className} tooltip`} data-tip={title} {...rest} onClick={onClickHandler}>
            {children}
        </button>
    );
}
