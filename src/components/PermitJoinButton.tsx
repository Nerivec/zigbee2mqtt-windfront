import { faAngleDown, faTowerBroadcast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type CSSProperties, type JSX, memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { useShallow } from "zustand/react/shallow";
import { PERMIT_JOIN_TIME_KEY } from "../localStoreConsts.js";
import { API_URLS, useAppStore } from "../store.js";
import type { Device } from "../types.js";
import { sendMessage } from "../websocket/WebSocketManager.js";
import Button from "./Button.js";
import DialogDropdown from "./DialogDropdown.js";
import SourceDot from "./SourceDot.js";
import Countdown from "./value-decorators/Countdown.js";

type PermitJoinButtonProps = {
    sidebarCollapsed: boolean;
};

type PermitJoinDropdownProps = {
    selectedRouter: [number, Device | undefined];
    setSelectedRouter: ReturnType<typeof useState<[number, Device | undefined]>>[1];
};

const PermitJoinDropdown = memo(({ selectedRouter, setSelectedRouter }: PermitJoinDropdownProps) => {
    const { t } = useTranslation("navbar");
    const devices = useAppStore((state) => state.devices);

    const routers = useMemo(() => {
        const filteredDevices: JSX.Element[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (device.type === "Coordinator" || device.type === "Router") {
                    filteredDevices.push(
                        <li
                            key={`${device.friendly_name}-${device.ieee_address}-${sourceIdx}`}
                            className="truncate"
                            onClick={() => setSelectedRouter([sourceIdx, device])}
                            onKeyUp={(e) => {
                                if (e.key === "enter") {
                                    setSelectedRouter([sourceIdx, device]);
                                }
                            }}
                        >
                            <span
                                className={`dropdown-item${selectedRouter[0] === sourceIdx && selectedRouter[1]?.ieee_address === device.ieee_address ? " menu-active" : ""}`}
                            >
                                <SourceDot idx={sourceIdx} autoHide namePostfix=" – " />
                                {device.friendly_name}
                            </span>
                        </li>,
                    );
                }
            }
        }

        filteredDevices.sort((elA, elB) => elA.key!.localeCompare(elB.key!));

        for (let sourceIdx = API_URLS.length - 1; sourceIdx >= 0; sourceIdx--) {
            filteredDevices.unshift(
                <li
                    key={`${sourceIdx}-all`}
                    className="truncate"
                    onClick={() => setSelectedRouter([sourceIdx, undefined])}
                    onKeyUp={(e) => {
                        if (e.key === "enter") {
                            setSelectedRouter([sourceIdx, undefined]);
                        }
                    }}
                >
                    <span className={`dropdown-item${selectedRouter[0] === sourceIdx && selectedRouter[1] === undefined ? " menu-active" : ""}`}>
                        <SourceDot idx={sourceIdx} autoHide namePostfix=" – " />
                        {t(($) => $.all)}
                    </span>
                </li>,
            );
        }

        return filteredDevices;
    }, [devices, selectedRouter, setSelectedRouter, t]);

    return (
        <DialogDropdown
            buttonChildren={
                <span className="tooltip tooltip-right" data-tip={t(($) => $.toggle_dropdown)}>
                    <FontAwesomeIcon icon={faAngleDown} />
                </span>
            }
            buttonStyle="btn-outline btn-primary btn-square join-item"
        >
            {routers}
        </DialogDropdown>
    );
});

const PermitJoinButton = memo(({ sidebarCollapsed }: PermitJoinButtonProps) => {
    const { t } = useTranslation("navbar");
    const [selectedRouter, setSelectedRouter] = useState<[number, Device | undefined]>([0, undefined]);
    const [permitClickedSourceIdx, setPermitClickedSourceIdx] = useState(0);
    const permitJoin = useAppStore(useShallow((state) => state.bridgeInfo[permitClickedSourceIdx].permit_join));
    const permitJoinEnd = useAppStore(useShallow((state) => state.bridgeInfo[permitClickedSourceIdx].permit_join_end));

    const onPermitJoinClick = useCallback(async () => {
        const [sourceIdx, device] = selectedRouter;

        setPermitClickedSourceIdx(sourceIdx);
        await sendMessage(sourceIdx, "bridge/request/permit_join", {
            time: permitJoin ? 0 : store2.get(PERMIT_JOIN_TIME_KEY, 254),
            device: device?.ieee_address,
        });
    }, [selectedRouter, permitJoin]);

    const permitJoinTimer = useMemo(
        () => (permitJoin ? <Countdown seconds={(permitJoinEnd! - Date.now()) / 1000} hideZeroes /> : null),
        [permitJoin, permitJoinEnd],
    );

    return sidebarCollapsed ? (
        <ul className="menu w-full p-2 gap-2">
            <li className="w-full">
                <Button<void>
                    onClick={onPermitJoinClick}
                    className="btn btn-outline btn-primary grid leading-none py-2.5 lg:tooltip lg:tooltip-right !w-full"
                    data-tip={`${permitJoin ? t(($) => $.disable_join) : t(($) => $.permit_join)}: ${selectedRouter[1] ? selectedRouter[1].friendly_name : t(($) => $.all)}`}
                >
                    <FontAwesomeIcon icon={faTowerBroadcast} className={permitJoin ? "text-success" : "text-error"} beat={permitJoin} />
                </Button>
            </li>
        </ul>
    ) : (
        <div className="menu w-full p-2 gap-2">
            <div className="indicator w-full mb-4">
                <div className="join join-horizontal w-full">
                    <Button<void> onClick={onPermitJoinClick} className="btn btn-outline btn-primary join-item flex-1 min-w-0">
                        <FontAwesomeIcon icon={faTowerBroadcast} className={permitJoin ? "text-success" : "text-error"} />
                        <span className="truncate">{permitJoin ? t(($) => $.disable_join) : t(($) => $.permit_join)}</span>
                        {permitJoin && permitJoinTimer}
                    </Button>

                    {!permitJoin && <PermitJoinDropdown selectedRouter={selectedRouter} setSelectedRouter={setSelectedRouter} />}
                </div>
                <div
                    className="indicator-item indicator-bottom indicator-center badge badge-sm badge-primary opacity-95 min-w-0 pointer-events-none"
                    style={{ "--indicator-y": "65%" } as CSSProperties}
                >
                    <SourceDot idx={selectedRouter[0]} autoHide alwaysHideName />
                    <span className="truncate">{selectedRouter[1]?.friendly_name ?? t(($) => $.all)}</span>
                </div>
            </div>
        </div>
    );
});

export default PermitJoinButton;
