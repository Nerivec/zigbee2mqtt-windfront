import Table from "../table/Table.js";
import type { UseGroupMembersTableReturn } from "./useGroupMembersTable.js";

interface GroupMembersListProps {
    table: UseGroupMembersTableReturn;
}

export default function GroupMembersList({ table }: GroupMembersListProps) {
    return (
        <div className="mb-5">
            <Table id="group-members" {...table} />
        </div>
    );
}
