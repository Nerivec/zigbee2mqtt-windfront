import { useCallback, useEffect, useState } from "react";
import store2 from "store2";
import { MAX_ON_SCREEN_NOTIFICATIONS_KEY } from "../../localStoreConsts.js";
import { useAppStore } from "../../store.js";
import type { LogMessage } from "../../types.js";
import Toast from "./Toast.js";

const TOAST_EXPIRY_TIME = 5000;

const BLACKLISTED_MESSAGES: string[] = ["MQTT publish"];

export default function Toasts() {
    const notificationFilter = useAppStore((state) => state.bridgeInfo.config.frontend.notification_filter);
    const lastLog = useAppStore((state) => state.lastNonDebugLog);
    const [logs, setLogs] = useState<LogMessage[]>([]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        if (
            lastLog &&
            !(notificationFilter ? BLACKLISTED_MESSAGES.concat(notificationFilter) : BLACKLISTED_MESSAGES).some((val) =>
                new RegExp(val).test(lastLog.message),
            )
        ) {
            setLogs([...logs, lastLog]);
        }
    }, [lastLog]);

    const removeLog = useCallback((idx: number) => {
        setLogs((prev) => {
            const newLogs = Array.from(prev);
            newLogs.splice(idx, 1);

            return newLogs;
        });
    }, []);

    return (
        <div className="toast z-99">
            {logs.slice(0, store2.get(MAX_ON_SCREEN_NOTIFICATIONS_KEY, 1)).map((log, idx) => (
                <Toast key={`${log.timestamp}-${log.message}`} idx={idx} log={log} expiry={TOAST_EXPIRY_TIME} remove={removeLog} />
            ))}
        </div>
    );
}
