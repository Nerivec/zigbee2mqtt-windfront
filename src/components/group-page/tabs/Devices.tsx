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
            <div className="flex flex-row flex-wrap gap-4 mb-4 w-full">
                <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-md flex-1">
                    <div className="card-body p-4">
                        <AddDeviceToGroup sourceIdx={sourceIdx} devices={devices} group={group} />
                    </div>
                </div>
                <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-md flex-1">
                    <div className="card-body p-4">
                        <RecallRemove sourceIdx={sourceIdx} target={group} />
                    </div>
                </div>
                <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-md flex-1">
                    <div className="card-body p-4">
                        <AddScene sourceIdx={sourceIdx} target={group} deviceState={{}} />
                    </div>
                </div>
            </div>

            <GroupMembers sourceIdx={sourceIdx} devices={devices} group={group} />
        </>
    );
}
