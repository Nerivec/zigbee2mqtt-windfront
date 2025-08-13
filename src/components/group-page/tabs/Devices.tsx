import { useAppStore } from "../../../store.js";
import type { Group } from "../../../types.js";
import AddScene from "../../device-page/AddScene.js";
import RecallRemove from "../../device-page/RecallRemove.js";
import AddDeviceToGroup from "../AddDeviceToGroup.js";
import GroupMembers from "../GroupMembers.js";

type DevicesProps = {
    group: Group;
};

export default function Devices({ group }: DevicesProps) {
    const devices = useAppStore((state) => state.devices);

    return (
        <>
            <div className="flex flex-row flex-wrap justify-evenly gap-4 mb-4">
                <div className="flex-1">
                    <AddDeviceToGroup devices={devices} group={group} />
                </div>
                <div className="flex-1">
                    <RecallRemove target={group} />
                </div>
                <div className="flex-1">
                    <AddScene target={group} deviceState={{}} />
                </div>
            </div>
            <GroupMembers devices={devices} group={group} />
        </>
    );
}
