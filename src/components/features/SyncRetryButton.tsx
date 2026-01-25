import { faRedo, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFeatureReading } from "./FeatureReadingContext.js";

// Short timeout for quick read before retry write
const QUICK_READ_TIMEOUT_MS = 2000;

/**
 * Consolidated sync/retry button that reads state from FeatureReadingContext.
 * Renders inline - place this inside your editor's flex-row for proper positioning.
 */
export default function SyncRetryButton() {
    const { t } = useTranslation("zigbee");
    const { isReading, readTimedOut, writeState, onRetry, onSync } = useFeatureReading();

    // Handle button click - retry (quick read then write) or sync (read)
    const handleClick = useCallback(() => {
        if (writeState?.isError || writeState?.isTimedOut) {
            // Retry: quick read (2s) then write
            onSync?.();
            setTimeout(() => {
                onRetry?.();
            }, QUICK_READ_TIMEOUT_MS);
        } else {
            // Normal sync: just read
            onSync?.();
        }
    }, [writeState?.isError, writeState?.isTimedOut, onSync, onRetry]);

    // Determine if button should show
    const showButton = onSync || writeState?.isError || writeState?.isTimedOut || writeState?.isPending;

    if (!showButton) {
        return null;
    }

    // Button styling based on state
    const getButtonClass = () => {
        if (writeState?.isError || writeState?.isTimedOut) {
            return "btn btn-xs btn-square btn-error btn-soft";
        }
        if (writeState?.isPending || isReading) {
            return "btn btn-xs btn-square btn-warning btn-soft";
        }
        if (readTimedOut) {
            return "btn btn-xs btn-square btn-error btn-soft";
        }
        return "btn btn-xs btn-square btn-primary btn-soft";
    };

    // Tooltip based on state
    const getTooltip = () => {
        if (writeState?.isTimedOut) {
            return t(($) => $.no_response_retry);
        }
        if (writeState?.isError) {
            return t(($) => $.command_failed_retry);
        }
        if (writeState?.isPending) {
            return t(($) => $.sending_to_device);
        }
        if (readTimedOut) {
            return t(($) => $.read_timed_out);
        }
        if (isReading) {
            return t(($) => $.reading_from_device);
        }
        return t(($) => $.get_value_from_device);
    };

    const isDisabled = writeState?.isPending || isReading;
    // faRedo = redo/retry (read + write)
    // faSync = sync (read only)
    const icon = writeState?.isError || writeState?.isTimedOut ? faRedo : faSync;
    const shouldSpin = writeState?.isPending || isReading;

    return (
        <div className="tooltip tooltip-left" data-tip={getTooltip()}>
            <button type="button" className={getButtonClass()} onClick={handleClick} disabled={isDisabled}>
                <FontAwesomeIcon icon={icon} className={shouldSpin ? "animate-spin" : ""} />
            </button>
        </div>
    );
}
