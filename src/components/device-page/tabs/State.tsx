import { useAppSelector } from "../../../hooks/useApp.js";
import type { Device } from "../../../types.js";
import Json from "../../value-decorators/Json.js";

type StatesProps = { device: Device };

export default function State(props: StatesProps) {
    const { device } = props;
    const deviceState = useAppSelector((state) => state.deviceStates[device.friendly_name] ?? {});

    return <Json obj={deviceState} />;
}
