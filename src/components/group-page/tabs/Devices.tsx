import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import type { Group } from "../../../types.js";
import AddScene from "../../device-page/AddScene.js";
import RecallRemove from "../../device-page/RecallRemove.js";
import AddDeviceToGroup from "../AddDeviceToGroup.js";
import GroupMembers from "../GroupMembers.js";

type DevicesProps = {
    sourceIdx: number;
    group: Group;
};

export default function Devices({ sourceIdx, group }: DevicesProps) {
    const devices = useAppStore(useShallow((state) => state.devices[sourceIdx]));

    return (
        <>
            <div className="flex flex-row flex-wrap justify-evenly gap-4 mb-4">
                <div className="flex-1">
                    <AddDeviceToGroup sourceIdx={sourceIdx} devices={devices} group={group} />
                </div>
                <div className="flex-1">
                    <RecallRemove sourceIdx={sourceIdx} target={group} />
                </div>
                <div className="flex-1">
                    <AddScene sourceIdx={sourceIdx} target={group} deviceState={{}} />
                </div>
            </div>
            <GroupMembers sourceIdx={sourceIdx} devices={devices} group={group} />
        </>
    );
}
