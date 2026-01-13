import { faRedo, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardDevice } from "./DashboardDeviceContext.js";

// Short timeout for quick read before retry write
const QUICK_READ_TIMEOUT_MS = 2000;

/**
 * Aggregate sync/retry button for device cards on the Dashboard.
 * Shows combined state of all features and triggers sync/retry for all.
 */
export default function DashboardSyncButton() {
    const { t } = useTranslation("zigbee");
    const ctx = useDashboardDevice();

    // Handle button click - retry all failed or sync all
    const handleClick = useCallback(() => {
        if (!ctx) return;

        const { hasAnyConflict, hasAnyTimeout, syncAll, retryAll } = ctx;

        if (hasAnyConflict || hasAnyTimeout) {
            // Retry: quick read all (2s) then write all failed
            syncAll();
            setTimeout(() => {
                retryAll();
            }, QUICK_READ_TIMEOUT_MS);
        } else {
            // Normal sync: just read all
            syncAll();
        }
    }, [ctx]);

    if (!ctx) {
        return null;
    }

    const { isAnyReading, isAnyPending, hasAnyConflict, hasAnyTimeout } = ctx;

    const needsRetry = hasAnyConflict || hasAnyTimeout;
    const isBusy = isAnyReading || isAnyPending;

    // Only show button when there's something to sync/retry
    // (pending, conflict, timeout, or actively reading)
    const hasActionableState = isBusy || needsRetry;
    if (!hasActionableState) {
        return null;
    }

    // Button styling based on aggregate state
    const getButtonClass = () => {
        if (needsRetry) {
            return "btn btn-square btn-sm btn-error btn-soft";
        }
        if (isBusy) {
            return "btn btn-square btn-sm btn-warning btn-soft";
        }
        return "btn btn-square btn-sm btn-primary btn-soft";
    };

    // Tooltip based on aggregate state
    const getTooltip = () => {
        if (hasAnyTimeout) {
            return t(($) => $.no_response_retry);
        }
        if (hasAnyConflict) {
            return t(($) => $.device_returned_different_retry);
        }
        if (isAnyPending) {
            return t(($) => $.sending_to_device);
        }
        if (isAnyReading) {
            return t(($) => $.reading_from_device);
        }
        return t(($) => $.sync_all_features);
    };

    // faRedo = redo/retry (read + write)
    // faSync = sync (read only)
    const icon = needsRetry ? faRedo : faSync;
    const shouldSpin = isBusy;

    return (
        <div className="tooltip tooltip-left" data-tip={getTooltip()}>
            <button type="button" className={getButtonClass()} onClick={handleClick} disabled={isBusy}>
                <FontAwesomeIcon icon={icon} className={shouldSpin ? "animate-spin" : ""} />
            </button>
        </div>
    );
}
