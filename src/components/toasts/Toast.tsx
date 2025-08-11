import { useEffect, useState } from "react";
import { LOG_LEVELS_CMAP } from "../../consts.js";
import type { LogMessage } from "../../types.js";

type ToastProps = {
    idx: number;
    log: LogMessage;
    expiry: number;
    remove: (idx: number) => void;
};

export default function Toast({ idx, log, expiry, remove }: ToastProps) {
    const [initialTimeout] = useState(Date.now() + expiry);

    useEffect(() => {
        const timer = setTimeout(() => {
            remove(idx);
        }, initialTimeout - Date.now());

        return () => {
            clearTimeout(timer);
        };
    }, [idx, remove, initialTimeout]);

    return (
        // biome-ignore lint/a11y/noStaticElementInteractions: special case
        <div className={`alert ${LOG_LEVELS_CMAP[log!.level]} break-all cursor-pointer select-none max-w-prose`} onClick={() => remove(idx)}>
            {log!.message}
        </div>
    );
}
