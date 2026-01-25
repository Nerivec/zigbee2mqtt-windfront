import { useFeatureReading } from "./FeatureReadingContext.js";

/**
 * StatusIndicator - Small colored dot showing editor state
 *
 * Displays a visual indicator based on the current write/read state:
 * - unknown (? icon): device value not yet known
 * - error (red dot): conflict or write timeout
 * - partial (warning triangle): some attributes succeeded, some failed
 * - warning (amber dot): pending write, reading, or queued for sleepy device
 * - success (green dot): device confirmed the value
 * - hidden: idle state (empty placeholder to prevent layout shift)
 *
 * Uses fixed-width wrapper to prevent layout shift when dot appears/disappears.
 * Error states show details in tooltip when available.
 */
export default function StatusIndicator() {
    const { isReading, isReadQueued, readTimedOut, readErrorDetails, writeState, isUnknown } = useFeatureReading();

    const dotClass = "inline-block w-2 h-2 rounded-full";

    // Fixed-size wrapper: width prevents layout shift, height matches typical control row (h-7 = 28px)
    const wrapper = (content: React.ReactNode) => <span className="inline-flex w-3 h-7 items-center justify-center shrink-0">{content}</span>;

    // Unknown value state (highest priority - show ? icon)
    if (isUnknown && !writeState?.isPending && !isReading && !isReadQueued) {
        return wrapper(
            <span
                className="tooltip tooltip-right z-50 inline-flex items-center justify-center w-3 h-3 rounded-full bg-base-300 text-base-content text-[8px] font-bold"
                data-tip="Value unknown"
            >
                ?
            </span>,
        );
    }

    // Write error states (highest priority after unknown)
    if (writeState?.isError || writeState?.isTimedOut) {
        let tooltip = writeState?.isTimedOut ? "Timed out" : "Error";

        // Add error details if available
        if (writeState?.errorDetails) {
            tooltip = `${writeState.errorDetails.code}: ${writeState.errorDetails.message}`;
            if (writeState.errorDetails.zcl_status !== undefined) {
                tooltip += ` (ZCL: ${writeState.errorDetails.zcl_status})`;
            }
        }

        return wrapper(<span className={`${dotClass} bg-error tooltip tooltip-right z-50`} data-tip={tooltip} />);
    }

    // Read error state (only show if we have error details from backend)
    if (readTimedOut && readErrorDetails) {
        let tooltip = `${readErrorDetails.code}: ${readErrorDetails.message}`;
        if (readErrorDetails.zcl_status !== undefined) {
            tooltip += ` (ZCL: ${readErrorDetails.zcl_status})`;
        }

        return wrapper(<span className={`${dotClass} bg-error tooltip tooltip-right z-50`} data-tip={tooltip} />);
    }

    // Partial success (warning triangle with failed attributes)
    if (writeState?.isPartial && writeState.failedAttributes) {
        const failedList = Object.entries(writeState.failedAttributes)
            .map(([attr, reason]) => `${attr}: ${reason}`)
            .join("\n");
        const tooltip = `Partial success\n\nFailed:\n${failedList}`;

        return wrapper(
            <span className="text-warning tooltip tooltip-right z-50 whitespace-pre-wrap text-left" data-tip={tooltip}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-labelledby="partial-warning-title"
                >
                    <title id="partial-warning-title">Partial success warning</title>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </span>,
        );
    }

    // Queued for sleepy device (orange dot, same as pending)
    if (writeState?.isQueued || isReadQueued) {
        return wrapper(<span className={`${dotClass} bg-warning tooltip tooltip-right z-50`} data-tip="Queued for sleepy device" />);
    }

    // Pending or reading (warning dot)
    if (writeState?.isPending || isReading) {
        return wrapper(<span className={`${dotClass} bg-warning tooltip tooltip-right z-50`} data-tip="Sending..." />);
    }

    // Confirmed (success)
    if (writeState?.isConfirmed) {
        return wrapper(<span className={`${dotClass} bg-success tooltip tooltip-right z-50`} data-tip="Confirmed" />);
    }

    // Idle - empty placeholder to prevent layout shift
    return wrapper(null);
}
