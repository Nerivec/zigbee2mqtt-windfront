import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import Json from "../../value-decorators/Json.js";

type StatesProps = {
    sourceIdx: number;
    device: Device;
};

export default function State({ sourceIdx, device }: StatesProps) {
    const deviceState = useAppStore(useShallow((state) => state.deviceStates[sourceIdx][device.friendly_name]));

    return <Json obj={deviceState ?? {}} />;
}
