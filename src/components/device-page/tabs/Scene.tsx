import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import AddScene from "../AddScene.js";
import RecallRemove from "../RecallRemove.js";

type SceneProps = {
    sourceIdx: number;
    device: Device;
};

export default function Scene({ sourceIdx, device }: SceneProps) {
    const deviceState = useAppStore(useShallow((state) => state.deviceStates[sourceIdx][device.friendly_name]));

    return (
        <div className="flex flex-row flex-wrap justify-around items-start gap-3 my-2">
            <div>
                <AddScene sourceIdx={sourceIdx} target={device} deviceState={deviceState ?? {}} />
            </div>
            <div>
                <RecallRemove sourceIdx={sourceIdx} target={device} />
            </div>
        </div>
    );
}
