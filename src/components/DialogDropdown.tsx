import { type HTMLAttributes, memo, type ReactElement, useState } from "react";
import Button from "./Button.js";

interface DialogDropdownProps extends HTMLAttributes<HTMLUListElement> {
    /** If `ReactElement`, expected to be `<FontAwesomeIcon />`. */
    buttonChildren: ReactElement | string;
    buttonStyle?: string;
    buttonDisabled?: boolean;
}

const DialogDropdown = memo(({ buttonChildren, buttonStyle, buttonDisabled, children }: DialogDropdownProps) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button item={!open} onClick={setOpen} className={`btn${buttonStyle ? ` ${buttonStyle}` : ""}`} disabled={buttonDisabled}>
                {buttonChildren}
            </Button>
            {open && (
                <dialog
                    className="modal modal-bottom sm:modal-middle"
                    open
                    onClick={(event) => {
                        if ((event.target as HTMLElement).tagName !== "INPUT") {
                            setOpen(false);
                        }
                    }}
                >
                    <div className="modal-box flex-nowrap p-1 w-auto! max-h-[90vh] menu" style={{ scrollbarWidth: "thin" }}>
                        {children}
                    </div>
                </dialog>
            )}
        </>
    );
});

export default DialogDropdown;
