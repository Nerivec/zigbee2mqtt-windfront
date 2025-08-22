import { faClose, faEllipsisH, faPowerOff, faServer, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, type RefObject, useCallback, useContext, useRef, type useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ReadyState } from "react-use-websocket";
import { useShallow } from "zustand/react/shallow";
import { LOG_LEVELS_CMAP } from "../consts.js";
import { API_URLS, useAppStore } from "../store.js";
import type { LogMessage } from "../types.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "./Button.js";
import ConfirmButton from "./ConfirmButton.js";
import SourceDot from "./SourceDot.js";

type NotificationsProps = {
    setShowNotifications: ReturnType<typeof useState<boolean>>[1];
};

type SourceNotificationsProps = { sourceIdx: number; readyState: ReadyState };

type NotificationProps = {
    log: LogMessage;
    onClick: (ref: RefObject<HTMLDivElement | null>) => void;
};

const CONNECTION_STATUS = {
    [ReadyState.CONNECTING]: "text-info",
    [ReadyState.OPEN]: "text-success",
    [ReadyState.CLOSING]: "text-warning",
    [ReadyState.CLOSED]: "text-error",
    [ReadyState.UNINSTANTIATED]: "text-error",
};

const Notification = memo(({ log, onClick }: NotificationProps) => {
    const alertRef = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={alertRef} className={`alert ${LOG_LEVELS_CMAP[log.level]} break-all gap-1 p-2 pe-0.5`} title={log.timestamp}>
            <span>{log.message}</span>
            <div className="justify-self-end">
                <Button item={alertRef} onClick={onClick} className="btn btn-xs btn-square">
                    <FontAwesomeIcon icon={faClose} />
                </Button>
            </div>
        </div>
    );
});

const SourceNotifications = memo(({ sourceIdx, readyState }: SourceNotificationsProps) => {
    const { t } = useTranslation(["navbar", "common"]);
    const { sendMessage, transactionPrefixes } = useContext(WebSocketApiRouterContext);
    const notifications = useAppStore(useShallow((state) => state.notifications[sourceIdx]));
    const restartRequired = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].restart_required));
    const clearNotifications = useAppStore((state) => state.clearNotifications);

    const restart = useCallback(async () => await sendMessage(sourceIdx, "bridge/request/restart", ""), [sourceIdx, sendMessage]);
    const onNotificationClick = useCallback((ref: RefObject<HTMLDivElement | null>) => {
        if (ref?.current) {
            ref.current.className += " hidden";
        }
    }, []);
    const onClearClick = useCallback(() => clearNotifications(sourceIdx), [sourceIdx, clearNotifications]);

    return (
        <li>
            <details open={sourceIdx === 0}>
                <summary>
                    <span title={`${sourceIdx} | ${t("transaction_prefix")}: ${transactionPrefixes[sourceIdx]}`}>
                        {API_URLS.length > 1 ? <SourceDot idx={sourceIdx} alwaysShowName /> : "Zigbee2MQTT"}
                    </span>
                    <span className="ml-auto">
                        {restartRequired && (
                            <ConfirmButton
                                className="btn btn-xs btn-square btn-error animate-pulse"
                                onClick={restart}
                                title={t("restart")}
                                modalDescription={t("common:dialog_confirmation_prompt")}
                                modalCancelLabel={t("common:cancel")}
                            >
                                <FontAwesomeIcon icon={faPowerOff} />
                            </ConfirmButton>
                        )}
                        <span title={`${t("websocket_status")}: ${ReadyState[readyState]}`}>
                            <FontAwesomeIcon icon={faServer} className={CONNECTION_STATUS[readyState]} />
                        </span>
                    </span>
                </summary>
                {notifications.map((log, idx) => (
                    <Notification key={`${idx}-${log.timestamp}`} log={log} onClick={onNotificationClick} />
                ))}
                {notifications.length > 0 && (
                    <div className="flex flex-row justify-between mt-3 mb-1">
                        <Link to={`/logs/${sourceIdx}`} className="btn btn-sm btn-primary btn-outline" title={t("common:more")}>
                            <FontAwesomeIcon icon={faEllipsisH} />
                            {t("common:more")}
                        </Link>
                        <Button className="btn btn-sm btn-error btn-outline" onClick={onClearClick} title={t("common:clear")}>
                            <FontAwesomeIcon icon={faTrashCan} />
                            {t("common:clear")}
                        </Button>
                    </div>
                )}
            </details>
        </li>
    );
});

const Notifications = memo(({ setShowNotifications }: NotificationsProps) => {
    const { t } = useTranslation("common");
    const { readyStates } = useContext(WebSocketApiRouterContext);
    const clearAllNotifications = useAppStore((state) => state.clearAllNotifications);

    return (
        <div
            className="drawer-side justify-items-end z-99"
            style={{ pointerEvents: "auto", visibility: "visible", overflowY: "auto", opacity: "100%" }}
        >
            {/** biome-ignore lint/a11y/noStaticElementInteractions: special case */}
            <span className="drawer-overlay" onClick={() => setShowNotifications(false)} />
            <aside className="bg-base-100 min-h-screen w-80" style={{ translate: "0%" }}>
                <ul className="menu w-full px-1 py-0">
                    {API_URLS.map((_v, idx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static
                        <SourceNotifications key={`${idx}`} sourceIdx={idx} readyState={readyStates[idx]} />
                    ))}
                    {API_URLS.length > 1 && (
                        <ConfirmButton
                            className="btn btn-sm btn-error btn-outline mt-5"
                            onClick={clearAllNotifications}
                            title={t("clear_all")}
                            modalDescription={t("dialog_confirmation_prompt")}
                            modalCancelLabel={t("cancel")}
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                            {t("clear_all")}
                        </ConfirmButton>
                    )}
                </ul>
            </aside>
        </div>
    );
});

export default Notifications;
