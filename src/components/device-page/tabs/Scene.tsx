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
        <div className="flex flex-row flex-wrap gap-4 w-full">
            <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-md flex-1">
                <div className="card-body p-4">
                    <AddScene sourceIdx={sourceIdx} target={device} deviceState={deviceState ?? {}} />
                </div>
            </div>
            <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-md flex-1">
                <div className="card-body p-4">
                    <RecallRemove sourceIdx={sourceIdx} target={device} />
                </div>
            </div>
        </div>
    );
}
