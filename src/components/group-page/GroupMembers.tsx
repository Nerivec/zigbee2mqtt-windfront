import { faTableCellsLarge, faTableList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Row } from "@tanstack/react-table";
import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { useShallow } from "zustand/react/shallow";
import { useColumnCount } from "../../hooks/useColumnCount.js";
import { GROUP_MEMBERS_VIEW_KEY } from "../../localStoreConsts.js";
import { useAppStore } from "../../store.js";
import type { Device, Group } from "../../types.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import TableSearch from "../table/TableSearch.js";
import GroupMember, { type GroupMemberProps } from "./GroupMember.js";
import GroupMembersList from "./GroupMembersList.js";
import { type GroupMembersTableData, useGroupMembersTable } from "./useGroupMembersTable.js";

interface GroupMembersProps {
    sourceIdx: number;
    devices: Device[];
    group: Group;
}

type GroupMembersView = "cards" | "list";

// mirrors DashboardItemGuarded: pass table rows straight through, guarding against filtering index quirks
const GroupMemberRow = ({ data }: { data?: Row<GroupMembersTableData> }) => (data ? <GroupMember data={data.original} /> : null);

const GroupMembers = memo(({ sourceIdx, devices, group }: GroupMembersProps) => {
    const availability = useAppStore((state) => state.availability);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const deviceStates = useAppStore(useShallow((state) => state.deviceStates[sourceIdx]));
    const lastSeenConfig = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].config.advanced.last_seen));
    const columnCount = useColumnCount();
    const { t } = useTranslation("groups");
    const [view, setView] = useState<GroupMembersView>(() => (store2.get(GROUP_MEMBERS_VIEW_KEY, "cards") === "list" ? "list" : "cards"));

    const onViewChange = useCallback((newView: GroupMembersView) => {
        store2.set(GROUP_MEMBERS_VIEW_KEY, newView);
        setView(newView);
    }, []);

    const removeDeviceFromGroup = useCallback(
        async (deviceIeee: string, endpoint: number): Promise<void> =>
            await sendMessage(sourceIdx, "bridge/request/group/members/remove", { device: deviceIeee, endpoint, group: group.id.toString() }),
        [sourceIdx, group.id],
    );

    const setDeviceState = useCallback(
        async (ieee: string, value: Record<string, unknown>): Promise<void> => {
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${ieee}/set`,
                value,
            );
        },
        [sourceIdx],
    );

    const filteredData = useMemo(() => {
        const elements: GroupMembersTableData[] = [];
        const availabilityEnabled = bridgeInfo[sourceIdx].config.availability.enabled;

        for (const groupMember of group.members) {
            const device = devices.find((device) => device.ieee_address === groupMember.ieee_address);

            if (device) {
                let deviceAvailability: GroupMemberProps["data"]["deviceAvailability"] = "disabled";
                let availabilityState: GroupMembersTableData["availabilityState"] = "offline";
                let availabilityEnabledForDevice: boolean | undefined;

                if (!device.disabled) {
                    const deviceAvailabilityConfig = bridgeInfo[sourceIdx].config.devices[device.ieee_address]?.availability;
                    availabilityEnabledForDevice = deviceAvailabilityConfig != null ? !!deviceAvailabilityConfig : undefined;
                    availabilityState = availability[sourceIdx][device.friendly_name]?.state ?? "offline";
                    deviceAvailability = (availabilityEnabledForDevice ?? availabilityEnabled) ? availabilityState : "disabled";
                }

                elements.push({
                    sourceIdx,
                    groupMember,
                    device,
                    deviceState: deviceStates[device.friendly_name] ?? {},
                    deviceAvailability,
                    availabilityState,
                    availabilityEnabledForDevice,
                    lastSeenConfig,
                    removeDeviceFromGroup,
                    setDeviceState,
                });
            }
        }

        return elements;
    }, [sourceIdx, group, devices, lastSeenConfig, deviceStates, bridgeInfo, availability, removeDeviceFromGroup, setDeviceState]);

    // single table instance shared by both views: search/filter/sorting apply to cards and list alike
    const membersTable = useGroupMembersTable({ sourceIdx, data: filteredData });
    const tableRows = membersTable.table.getRowModel().rows;

    return (
        <div>
            <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
                <TableSearch {...membersTable} />
                <div className="join ms-auto">
                    <Button<void>
                        className={`btn btn-sm join-item ${view === "cards" ? "btn-primary" : "btn-ghost"}`}
                        title={t(($) => $.view_cards)}
                        aria-label={t(($) => $.view_cards)}
                        aria-pressed={view === "cards"}
                        onClick={() => onViewChange("cards")}
                    >
                        <FontAwesomeIcon icon={faTableCellsLarge} />
                    </Button>
                    <Button<void>
                        className={`btn btn-sm join-item ${view === "list" ? "btn-primary" : "btn-ghost"}`}
                        title={t(($) => $.view_list)}
                        aria-label={t(($) => $.view_list)}
                        aria-pressed={view === "list"}
                        onClick={() => onViewChange("list")}
                    >
                        <FontAwesomeIcon icon={faTableList} />
                    </Button>
                </div>
            </div>
            {view === "list" ? (
                <GroupMembersList table={membersTable} />
            ) : (
                <VirtuosoMasonry
                    // XXX: issues with filtering, workaround, re-render when it changes (same as dashboard masonry)
                    key={`groupmembers-${tableRows.length}-${membersTable.globalFilter}-${membersTable.columnFilters.length}`}
                    useWindowScroll={true}
                    columnCount={columnCount}
                    data={tableRows}
                    ItemContent={GroupMemberRow}
                    className="gap-3"
                />
            )}
        </div>
    );
});

export default GroupMembers;
