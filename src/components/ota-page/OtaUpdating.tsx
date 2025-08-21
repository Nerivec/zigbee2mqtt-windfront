import type { DeviceState } from "../../types.js";

type UpdatingProps = {
    label: string;
    remaining: NonNullable<DeviceState["update"]>["remaining"];
    progress: NonNullable<DeviceState["update"]>["progress"];
};

const OtaUpdating = ({ label, remaining, progress }: UpdatingProps) => {
    if (remaining && remaining > 0) {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor(remaining / 60) % 60;
        const seconds = Math.floor(remaining % 60);
        const showHours = hours > 0;
        const showMinutes = minutes > 0;

        return (
            <>
                <progress className="progress" value={progress} max="100" />
                <div>
                    {label} {showHours ? `${hours}:` : ""}
                    {showMinutes ? `${minutes.toString().padStart(2, "0")}:` : ""}
                    {seconds.toString().padStart(2, "0")}
                </div>
            </>
        );
    }

    return <progress className="progress" value={progress} max="100" />;
};

export default OtaUpdating;
