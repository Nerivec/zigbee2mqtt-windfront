import { faClose, faEllipsisH, faInbox, faPowerOff, faServer, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, type RefObject, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { CONNECTION_STATUS, LOG_LEVELS_CMAP } from "../consts.js";
import { API_URLS, MULTI_INSTANCE, useAppStore } from "../store.js";
import type { LogMessage } from "../types.js";
import { getTransactionPrefix, sendMessage } from "../websocket/WebSocketManager.js";
import Button from "./Button.js";
import ConfirmButton from "./ConfirmButton.js";
import SourceDot from "./SourceDot.js";

type SourceNotificationsProps = { sourceIdx: number; readyState: number };

type NotificationProps = {
    log: LogMessage;
    onClick: (ref: RefObject<HTMLDivElement | null>) => void;
};

const Notification = memo(({ log, onClick }: NotificationProps) => {
    const alertRef = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={alertRef}
            className={`alert ${LOG_LEVELS_CMAP[log.level]} break-all gap-1 p-2 pe-0.5 tooltip tooltip-left`}
            data-tip={log.timestamp}
        >
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
    const status = CONNECTION_STATUS[readyState];
    const { t } = useTranslation(["navbar", "common"]);
    const notifications = useAppStore(useShallow((state) => state.notifications[sourceIdx]));
    const restartRequired = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].restart_required));
    const clearNotifications = useAppStore((state) => state.clearNotifications);

    const restart = useCallback(async () => await sendMessage(sourceIdx, "bridge/request/restart", ""), [sourceIdx]);
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
                    <span title={`${sourceIdx} | ${t(($) => $.transaction_prefix)}: ${getTransactionPrefix(sourceIdx)}`}>
                        {MULTI_INSTANCE ? <SourceDot idx={sourceIdx} alwaysShowName /> : "Zigbee2MQTT"}
                    </span>
                    <span className="ml-auto">
                        {restartRequired && (
                            <ConfirmButton
                                className="btn btn-xs btn-square btn-error animate-pulse"
                                onClick={restart}
                                title={t(($) => $.restart)}
                                modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                            >
                                <FontAwesomeIcon icon={faPowerOff} />
                            </ConfirmButton>
                        )}
                        <span title={`${t(($) => $.websocket_status)}: ${status?.[0]}`}>
                            <FontAwesomeIcon icon={faServer} className={status?.[1]} />
                        </span>
                    </span>
                </summary>
                {notifications.map((log, idx) => (
                    <Notification key={`${idx}-${log.timestamp}`} log={log} onClick={onNotificationClick} />
                ))}
                {notifications.length > 0 && (
                    <div className="flex flex-row justify-between mt-3 mb-1">
                        <Link to={`/logs/${sourceIdx}`} className="btn btn-sm btn-primary btn-outline" title={t(($) => $.more, { ns: "common" })}>
                            <FontAwesomeIcon icon={faEllipsisH} />
                            {t(($) => $.more, { ns: "common" })}
                        </Link>
                        <Button className="btn btn-sm btn-warning btn-outline" onClick={onClearClick} title={t(($) => $.clear, { ns: "common" })}>
                            <FontAwesomeIcon icon={faTrashCan} />
                            {t(($) => $.clear, { ns: "common" })}
                        </Button>
                    </div>
                )}
            </details>
        </li>
    );
});

const Notifications = memo(() => {
    const { t } = useTranslation("common");
    const readyStates = useAppStore((state) => state.readyStates);
    const clearAllNotifications = useAppStore((state) => state.clearAllNotifications);

    return (
        <>
            <div className="flex items-center gap-2 p-2">
                <FontAwesomeIcon icon={faInbox} />
                <span className="font-semibold text-md">{t(($) => $.notifications)}</span>
            </div>
            <ul className="menu w-full px-1 py-0">
                {API_URLS.map((_v, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static
                    <SourceNotifications key={`${idx}`} sourceIdx={idx} readyState={readyStates[idx]} />
                ))}
                {MULTI_INSTANCE && (
                    <ConfirmButton
                        className="btn btn-sm btn-warning btn-outline mt-5"
                        onClick={clearAllNotifications}
                        title={t(($) => $.clear_all)}
                        modalDescription={t(($) => $.dialog_confirmation_prompt)}
                        modalCancelLabel={t(($) => $.cancel)}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                        {t(($) => $.clear_all)}
                    </ConfirmButton>
                )}
            </ul>
        </>
    );
});

export default Notifications;
