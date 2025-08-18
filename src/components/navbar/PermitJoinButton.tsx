import { faAngleDown, faTowerBroadcast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { useShallow } from "zustand/react/shallow";
import { PERMIT_JOIN_TIME_KEY } from "../../localStoreConsts.js";
import { API_URLS, useAppStore } from "../../store.js";
import type { Device } from "../../types.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import Button from "../Button.js";
import PopoverDropdown from "../PopoverDropdown.js";
import SourceDot from "../SourceDot.js";
import Countdown from "../value-decorators/Countdown.js";

type PermitJoinDropdownProps = {
    setSelectedRouter: ReturnType<typeof useState<[number, Device | undefined]>>[1];
};

const PermitJoinDropdown = memo(({ setSelectedRouter }: PermitJoinDropdownProps) => {
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
                            onClick={() => setSelectedRouter([sourceIdx, device])}
                            onKeyUp={(e) => {
                                if (e.key === "enter") {
                                    setSelectedRouter([sourceIdx, device]);
                                }
                            }}
                        >
                            <span className="btn btn-sm btn-block btn-ghost">
                                <SourceDot idx={sourceIdx} autoHide />
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
                    onClick={() => setSelectedRouter([sourceIdx, undefined])}
                    onKeyUp={(e) => {
                        if (e.key === "enter") {
                            setSelectedRouter([sourceIdx, undefined]);
                        }
                    }}
                >
                    <span className="btn btn-sm btn-block btn-ghost">
                        <SourceDot idx={sourceIdx} autoHide />
                        {t("all")}
                    </span>
                </li>,
            );
        }

        return filteredDevices;
    }, [devices, setSelectedRouter, t]);

    return (
        <PopoverDropdown
            name="permit-join"
            buttonChildren={
                <span title={t("toggle_dropdown")}>
                    <FontAwesomeIcon icon={faAngleDown} />
                </span>
            }
            buttonStyle="btn-square join-item"
            dropdownStyle="dropdown-end"
        >
            {routers}
        </PopoverDropdown>
    );
});

const PermitJoinButton = memo(() => {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
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
    }, [selectedRouter, permitJoin, sendMessage]);

    const permitJoinTimer = useMemo(
        () => (permitJoin ? <Countdown seconds={(permitJoinEnd! - Date.now()) / 1000} hideZeroes /> : null),
        [permitJoin, permitJoinEnd],
    );

    const pjButton = useMemo(() => {
        const [sourceIdx, device] = selectedRouter;

        if (permitJoin) {
            return (
                <Button<void> onClick={onPermitJoinClick} className="btn btn-outline-secondary join-item" title={t("disable_join")}>
                    <FontAwesomeIcon icon={faTowerBroadcast} className="text-success" beatFade /> <SourceDot idx={sourceIdx} autoHide />{" "}
                    {device?.friendly_name ?? t("all")}
                    {permitJoinTimer}
                </Button>
            );
        }

        return (
            <Button<void> onClick={onPermitJoinClick} className="btn btn-outline-secondary join-item" title={t("permit_join")}>
                <FontAwesomeIcon icon={faTowerBroadcast} className="text-error" /> <SourceDot idx={sourceIdx} autoHide />{" "}
                {device?.friendly_name ?? t("all")}
            </Button>
        );
    }, [permitJoin, permitJoinTimer, selectedRouter, t, onPermitJoinClick]);

    return (
        <div className="join join-horizontal">
            {pjButton}
            {!permitJoin && <PermitJoinDropdown setSelectedRouter={setSelectedRouter} />}
        </div>
    );
});

export default PermitJoinButton;
