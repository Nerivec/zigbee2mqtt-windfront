import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import AddScene from "../AddScene.js";
import RecallRemove from "../RecallRemove.js";

type SceneProps = {
    device: Device;
};

export default function Scene(props: SceneProps) {
    const deviceState = useAppStore((state) => state.deviceStates[props.device.friendly_name] ?? {});

    return (
        <div className="flex flex-row flex-wrap justify-around items-start gap-3 my-2">
            <div>
                <AddScene target={props.device} deviceState={deviceState} />
            </div>
            <div>
                <RecallRemove target={props.device} />
            </div>
        </div>
    );
}
