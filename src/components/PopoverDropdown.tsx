import { type CSSProperties, type HTMLAttributes, type MouseEvent, memo, type ReactElement, useCallback } from "react";
import Button from "./Button.js";

interface PopoverDropdownProps extends HTMLAttributes<HTMLUListElement> {
    name: string;
    /** If `ReactElement`, expected to be `<FontAwesomeIcon />`. */
    buttonChildren: ReactElement | string;
    buttonStyle?: string;
    buttonDisabled?: boolean;
    dropdownStyle?: string;
}

const PopoverDropdown = memo((props: PopoverDropdownProps) => {
    const { name, buttonChildren, buttonStyle, buttonDisabled, dropdownStyle, children } = props;
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
                className={`dropdown menu min-w-48 rounded-box bg-base-200 shadow-sm${dropdownStyle ? ` ${dropdownStyle}` : ""}`}
                popover=""
                id={popoverId}
                style={{ positionAnchor: anchorName, maxHeight: "95vh" } as CSSProperties}
                onClick={onPopoverClick}
            >
                {children}
            </ul>
            <Button
                className={`btn${buttonStyle ? ` ${buttonStyle}` : ""}`}
                popoverTarget={popoverId}
                style={{ anchorName: anchorName } as CSSProperties}
                disabled={buttonDisabled}
            >
                {buttonChildren}
            </Button>
        </>
    );
});

export default PopoverDropdown;
