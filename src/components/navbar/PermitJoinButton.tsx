import { faAngleDown, faTowerBroadcast } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { PERMIT_JOIN_TIME_KEY } from "../../localStoreConsts.js";
import { useAppStore } from "../../store.js";
import type { Device } from "../../types.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import Button from "../Button.js";
import PopoverDropdown from "../PopoverDropdown.js";
import Countdown from "../value-decorators/Countdown.js";

type PermitJoinDropdownProps = {
    setSelectedRouter: ReturnType<typeof useState<Device>>[1];
};

const PermitJoinDropdown = memo(({ setSelectedRouter }: PermitJoinDropdownProps) => {
    const { t } = useTranslation("navbar");
    const devices = useAppStore((state) => state.devices);
    const routers = useMemo(() => {
        const filteredDevices: JSX.Element[] = [];

        for (const device of devices) {
            if (device.type === "Coordinator" || device.type === "Router") {
                filteredDevices.push(
                    <li
                        key={device.friendly_name}
                        onClick={() => setSelectedRouter(device)}
                        onKeyUp={(e) => {
                            if (e.key === "enter") {
                                setSelectedRouter(device);
                            }
                        }}
                    >
                        <span className="btn btn-sm btn-block btn-ghost">{device.friendly_name}</span>
                    </li>,
                );
            }
        }

        filteredDevices.sort((a, b) => (a.key === "Coordinator" ? -1 : a.key!.localeCompare(b.key!)));

        return filteredDevices;
    }, [devices, setSelectedRouter]);

    return (
        <PopoverDropdown
            name="permit-join"
            buttonChildren={
                <span title={t("toggle_dropdown")}>
                    <FontAwesomeIcon icon={faAngleDown} />
                </span>
            }
            buttonStyle="join-item"
            dropdownStyle="dropdown-end"
        >
            <li
                key="all"
                onClick={() => setSelectedRouter(undefined)}
                onKeyUp={(e) => {
                    if (e.key === "enter") {
                        setSelectedRouter(undefined);
                    }
                }}
            >
                <span className="btn btn-sm btn-block btn-ghost">{t("all")}</span>
            </li>
            {routers}
        </PopoverDropdown>
    );
});

const PermitJoinButton = memo(() => {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("navbar");
    const [selectedRouter, setSelectedRouter] = useState<Device>();
    const permitJoin = useAppStore((state) => state.bridgeInfo.permit_join);
    const permitJoinEnd = useAppStore((state) => state.bridgeInfo.permit_join_end);

    const onPermitJoinClick = useCallback(
        async () =>
            await sendMessage("bridge/request/permit_join", {
                time: permitJoin ? 0 : store2.get(PERMIT_JOIN_TIME_KEY, 254),
                device: selectedRouter?.ieee_address,
            }),
        [sendMessage, selectedRouter, permitJoin],
    );

    const permitJoinTimer = useMemo(
        () => (permitJoin ? <Countdown seconds={(permitJoinEnd! - Date.now()) / 1000} hideZeroes /> : null),
        [permitJoin, permitJoinEnd],
    );

    const pjButton = useMemo(() => {
        if (permitJoin) {
            return (
                <Button<void> onClick={onPermitJoinClick} className="btn btn-outline-secondary join-item" title={t("disable_join")}>
                    <FontAwesomeIcon icon={faTowerBroadcast} className="text-success" beatFade /> {selectedRouter?.friendly_name ?? t("all")}
                    {permitJoinTimer}
                </Button>
            );
        }

        return (
            <Button<void> onClick={onPermitJoinClick} className="btn btn-outline-secondary join-item" title={t("permit_join")}>
                <FontAwesomeIcon icon={faTowerBroadcast} className="text-error" /> {selectedRouter?.friendly_name ?? t("all")}
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
