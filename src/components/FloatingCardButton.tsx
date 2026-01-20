import {
    arrow,
    autoPlacement,
    FloatingArrow,
    FloatingPortal,
    offset,
    type Placement,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from "@floating-ui/react";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, type PropsWithChildren, useCallback, useRef, useState } from "react";
import Button from "./Button.js";

interface FloatingCardButtonProps extends PropsWithChildren {
    placement?: Placement;
    buttonClassName: string;
    buttonIcon?: IconProp;
    buttonTitle?: string;
    title: string;
    onApply?(...args: unknown[]): Promise<void> | void;
    canApply?: boolean;
}

export default function FloatingCardButton({
    placement,
    buttonClassName,
    buttonIcon,
    buttonTitle,
    title,
    onApply,
    canApply,
    children,
}: FloatingCardButtonProps): JSX.Element {
    const arrowRef = useRef(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: isAddOpen,
        onOpenChange: setIsAddOpen,
        placement,
        middleware: !placement
            ? [offset(8), autoPlacement({ padding: 16, crossAxis: true }), shift({ padding: 16, crossAxis: true }), arrow({ element: arrowRef })]
            : [offset(8), shift({ padding: 16, crossAxis: true }), arrow({ element: arrowRef })],
    });
    const click = useClick(context, { event: "click" });
    const dismiss = useDismiss(context);
    const role = useRole(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const handleApply = useCallback(
        async (...args: unknown[]): Promise<void> => {
            await onApply?.(...args);

            setIsAddOpen(false);
        },
        [onApply],
    );

    return (
        <>
            <button ref={refs.setReference} type="button" className={buttonClassName} {...getReferenceProps()}>
                {buttonIcon ? <FontAwesomeIcon icon={buttonIcon} /> : null}
                {buttonTitle ? <span>{buttonTitle}</span> : null}
            </button>
            {isAddOpen ? (
                <FloatingPortal>
                    <aside
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps({
                            className: "card bg-base-200 shadow-lg border border-base-300 w-[min(32rem,calc(100vw-2.5rem))] max-h-[80vh] z-11",
                        })}
                    >
                        <div className="card-body px-4 py-3">
                            <div className="flex items-center justify-between">
                                <h4 className="card-title">{title}</h4>
                                <Button onClick={() => setIsAddOpen(false)} className="btn btn-ghost btn-square">
                                    <FontAwesomeIcon icon={faClose} />
                                </Button>
                            </div>
                            {children}
                            <div className="card-actions justify-end">
                                <Button onClick={handleApply} className="btn btn-outline btn-primary btn-square btn-square" disabled={!canApply}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </Button>
                            </div>
                        </div>
                        <FloatingArrow
                            ref={arrowRef}
                            context={context}
                            className="fill-base-200 [&>path:first-of-type]:stroke-base-300 [&>path:last-of-type]:stroke-base-300"
                        />
                    </aside>
                </FloatingPortal>
            ) : null}
        </>
    );
}
