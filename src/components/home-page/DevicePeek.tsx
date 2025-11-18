import {
    arrow,
    autoPlacement,
    FloatingArrow,
    FloatingPortal,
    offset,
    shift,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from "@floating-ui/react";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { HomePageSelection } from "../../pages/HomePage.js";
import { toHex } from "../../utils.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import { getScenes } from "../device-page/index.js";
import Exposes from "../device-page/tabs/Exposes.js";

export interface DevicePeekProps {
    selection: HomePageSelection;
    onClose(): void;
}

const DevicePeek = memo(({ selection: { anchor, sourceIdx, device }, onClose }: DevicePeekProps) => {
    const { t } = useTranslation("zigbee");
    const arrowRef = useRef(null);
    const { refs, floatingStyles, context } = useFloating({
        elements: { reference: anchor },
        // placement: "right",
        open: true,
        onOpenChange: (open) => {
            if (!open) {
                onClose();
            }
        },
        middleware: [
            offset(4),
            // flip({ fallbackAxisSideDirection: "end", fallbackPlacements: ["left", "top", "bottom"], padding: 16 }),
            autoPlacement({ padding: 16, crossAxis: true }),
            shift({ padding: 16, crossAxis: true }),
            arrow({
                element: arrowRef,
            }),
        ],
    });
    const role = useRole(context);
    const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true });
    const { getFloatingProps } = useInteractions([role, dismiss]);
    const scenes = useMemo(() => getScenes(device), [device]);

    const onSceneClick = useCallback(
        async (sceneId: number) =>
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${device.friendly_name}/set`, // TODO: swap to ID/ieee_address
                { scene_recall: sceneId },
            ),
        [sourceIdx, device.friendly_name],
    );

    const description = device.description ?? device.definition?.description;

    return (
        <FloatingPortal>
            <aside
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps({
                    className: "card bg-base-200 shadow-lg border border-base-300 w-[min(32rem,calc(100vw-2.5rem))] max-h-[80vh] z-11",
                })}
            >
                <div className="card-body p-3 gap-2 w-full h-full overflow-hidden">
                    <header className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="truncate link link-hover font-semibold text-lg">
                                {device.friendly_name}
                            </Link>
                            <p className="truncate text-sm opacity-60">{description}</p>
                            <span className="badge cursor-default tooltip tooltip-bottom" data-tip={t(($) => $.ieee_address)}>
                                {device.ieee_address}
                            </span>
                            <span className="badge cursor-default tooltip tooltip-bottom" data-tip={t(($) => $.network_address_hex)}>
                                {toHex(device.network_address, 4)}
                            </span>
                            <span className="badge cursor-default tooltip tooltip-bottom" data-tip={t(($) => $.network_address_dec)}>
                                {device.network_address}
                            </span>
                        </div>
                        <Button onClick={onClose} className="btn btn-ghost btn-sm">
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                    </header>

                    {scenes.length > 0 && (
                        <div className="flex flex-row flex-wrap items-center gap-2">
                            {t(($) => $.scenes)}:
                            {scenes.map((scene) => (
                                <Button<number> key={scene.id} className="btn btn-outline btn-primary btn-sm" onClick={onSceneClick} item={scene.id}>
                                    {scene.name}
                                </Button>
                            ))}
                        </div>
                    )}
                    <div className="w-full h-full overflow-y-auto rounded-box" style={{ scrollbarWidth: "thin" }}>
                        <Exposes sourceIdx={sourceIdx} device={device} />
                    </div>
                </div>
                <FloatingArrow
                    ref={arrowRef}
                    context={context}
                    className="fill-base-200 [&>path:first-of-type]:stroke-base-300 [&>path:last-of-type]:stroke-base-300"
                />
            </aside>
        </FloatingPortal>
    );
});

export default DevicePeek;
