import { type JSX, memo, useEffect, useMemo, useState } from "react";
import store2 from "store2";
import { TOAST_STATUSES_CMAP } from "../consts.js";
import { MAX_ON_SCREEN_NOTIFICATIONS_KEY } from "../localStoreConsts.js";
import { type AppState, useAppStore } from "../store.js";

type ToastProps = {
    idx: number;
    toast: AppState["toasts"][number];
    remove: (idx: number) => void;
};

const TOAST_EXPIRY_TIME = 5000;

const Toast = memo(({ idx, toast, remove }: ToastProps) => {
    const [initialTimeout] = useState(Date.now() + TOAST_EXPIRY_TIME);

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
        <div className={`alert ${TOAST_STATUSES_CMAP[toast.status]} break-all cursor-pointer select-none max-w-prose`} onClick={() => remove(idx)}>
            {toast.topic}: {toast.error ?? "OK"}
            {toast.transaction ? ` (${toast.transaction})` : ""}
        </div>
    );
});

export default function Toasts() {
    const toasts = useAppStore((state) => state.toasts);
    const removeToast = useAppStore((state) => state.removeToast);

    const renderToasts = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let i = 0; i < store2.get(MAX_ON_SCREEN_NOTIFICATIONS_KEY, 3); i++) {
            const toast = toasts[i];

            if (!toast) {
                break;
            }

            elements.push(<Toast key={`${i}-${toast.transaction}`} idx={i} toast={toast} remove={removeToast} />);
        }

        return elements;
    }, [toasts, removeToast]);

    return <div className="toast z-98">{renderToasts}</div>;
}
