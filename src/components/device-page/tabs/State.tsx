import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import Json from "../../value-decorators/Json.js";

type StatesProps = { device: Device };

export default function State(props: StatesProps) {
    const { device } = props;
    const deviceState = useAppStore((state) => state.deviceStates[device.friendly_name] ?? {});

    return <Json obj={deviceState} />;
}
