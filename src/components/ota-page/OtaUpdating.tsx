import type { DeviceState } from "../../types.js";
import Duration from "../value-decorators/Duration.js";

type UpdatingProps = {
    label: string;
    remaining: NonNullable<DeviceState["update"]>["remaining"];
    progress: NonNullable<DeviceState["update"]>["progress"];
};

const OtaUpdating = ({ label, remaining, progress }: UpdatingProps) => {
    if (remaining && remaining > 0) {
        return (
            <>
                <progress className="progress" value={progress} max="100" />
                <div>
                    {label} <Duration durationSec={remaining} />
                </div>
            </>
        );
    }

    return <progress className="progress" value={progress} max="100" />;
};

export default OtaUpdating;
