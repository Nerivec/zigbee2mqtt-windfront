import { type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactElement, memo, useCallback } from "react";
import Button from "./Button.js";

interface PopoverDropdownProps extends HTMLAttributes<HTMLUListElement> {
    name: string;
    buttonChildren: ReactElement | string;
    buttonStyle?: string;
    dropdownStyle?: string;
}

const PopoverDropdown = memo((props: PopoverDropdownProps) => {
    const { buttonChildren, children, name, buttonStyle, dropdownStyle } = props;
    const popoverId = `popover-${name}`;
    const anchorName = `--anchor-${name}`;

    const onPopoverClick = useCallback((event: MouseEvent<HTMLUListElement>) => {
        if ((event.target as HTMLElement).tagName !== "INPUT") {
            event.currentTarget.togglePopover(false);
        }
    }, []);

    return (
        <>
            <ul
                className={`dropdown menu w-52 rounded-box bg-base-100 shadow-sm${dropdownStyle ? ` ${dropdownStyle}` : ""}`}
                popover=""
                id={popoverId}
                style={{ positionAnchor: anchorName, maxHeight: "95vh" } as CSSProperties}
                onClick={onPopoverClick}
            >
                {children}
            </ul>
            <Button
                className={`btn${typeof buttonChildren !== "string" && (buttonChildren.type === "i" || buttonChildren.type === "img") ? " btn-square" : ""}${buttonStyle ? ` ${buttonStyle}` : ""}`}
                popoverTarget={popoverId}
                style={{ anchorName: anchorName } as CSSProperties}
            >
                {buttonChildren}
            </Button>
        </>
    );
});

export default PopoverDropdown;
