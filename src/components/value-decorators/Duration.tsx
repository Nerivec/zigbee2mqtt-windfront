import { memo } from "react";

type DurationProps = {
    durationSec: number;
};

const Duration = memo(({ durationSec }: DurationProps) => {
    if (durationSec && durationSec > 0) {
        const hours = Math.floor(durationSec / 3600);
        const minutes = Math.floor(durationSec / 60) % 60;
        const seconds = Math.floor(durationSec % 60);
        const showHours = hours > 0;
        const showMinutes = minutes > 0;

        return (
            <>
                {showHours ? `${hours}:` : ""}
                {showMinutes ? `${minutes.toString().padStart(2, "0")}:` : ""}
                {seconds.toString().padStart(2, "0")}
            </>
        );
    }

    return null;
});

export default Duration;
