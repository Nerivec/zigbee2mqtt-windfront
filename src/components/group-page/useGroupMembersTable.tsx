import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useTable } from "../../hooks/useTable.js";
import { useAppStore } from "../../store.js";
import type { AvailabilityState } from "../../types.js";
import { getLastSeenEpoch } from "../../utils.js";
import ConfirmButton from "../ConfirmButton.js";
import DeviceImage from "../device/DeviceImage.js";
import Availability from "../value-decorators/Availability.js";
import DefinitionLink from "../value-decorators/DefinitionLink.js";
import LastSeen from "../value-decorators/LastSeen.js";
import Lqi from "../value-decorators/Lqi.js";
import VendorLink from "../value-decorators/VendorLink.js";
import type { GroupMemberProps } from "./GroupMember.js";

export type GroupMembersTableData = GroupMemberProps["data"] & {
    availabilityState: AvailabilityState["state"];
    availabilityEnabledForDevice: boolean | undefined;
};

export type UseGroupMembersTableProps = {
    sourceIdx: number;
    data: GroupMembersTableData[];
};

export function useGroupMembersTable({ sourceIdx, data }: UseGroupMembersTableProps): ReturnType<typeof useTable<GroupMembersTableData>> {
    const { t } = useTranslation(["groups", "common", "zigbee", "availability"]);
    const availabilityFeatureEnabled = useAppStore((state) => state.bridgeInfo[sourceIdx].config.availability.enabled);

    const columns = useMemo<ColumnDef<GroupMembersTableData, unknown>[]>(
        () => [
            {
                id: "friendly_name",
                minSize: 175,
                header: t(($) => $.friendly_name, { ns: "common" }),
                accessorFn: ({ device }) => `${device.friendly_name} ${device.description ?? ""}`,
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} disabled={device.disabled} />
                            </div>
                        </div>
                        {/* min-w-0 serves to properly truncate content */}
                        <div className="grow flex flex-col min-w-0">
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover truncate">
                                {device.friendly_name}
                            </Link>
                            {device.description && (
                                <div className="max-w-3xs text-xs opacity-50 truncate" title={device.description}>
                                    {device.description}
                                </div>
                            )}
                        </div>
                    </div>
                ),
                sortingFn: (rowA, rowB) => rowA.original.device.friendly_name.localeCompare(rowB.original.device.friendly_name),
                filterFn: "includesString",
                meta: { filterVariant: "text", textFaceted: true },
            },
            {
                id: "endpoint",
                size: 100,
                header: t(($) => $.endpoint, { ns: "zigbee" }),
                accessorFn: ({ groupMember }) => groupMember.endpoint,
                cell: ({
                    row: {
                        original: { groupMember },
                    },
                }) => <span className="badge badge-ghost badge-sm cursor-default font-mono">{groupMember.endpoint}</span>,
                filterFn: "equals",
                meta: { filterVariant: "select", showFacetedOccurrences: true },
            },
            {
                id: "model",
                minSize: 150,
                header: t(($) => $.model, { ns: "zigbee" }),
                accessorFn: ({ device }) =>
                    `${device.definition?.model ?? ""} ${device.model_id ?? ""} ${device.definition?.vendor ?? device.manufacturer ?? ""}`,
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <DefinitionLink supported={device.supported} definitionModel={device.definition?.model} />
                        <div className="flex flex-row gap-1">
                            <span className="badge badge-ghost badge-sm tooltip tooltip-bottom" data-tip={t(($) => $.manufacturer, { ns: "zigbee" })}>
                                <VendorLink supported={device.supported} definitionVendor={device.definition?.vendor} />
                            </span>
                        </div>
                    </>
                ),
                filterFn: "includesString",
                meta: { filterVariant: "text", textFaceted: true, showFacetedOccurrences: true },
            },
            {
                id: "lqi",
                size: 70,
                header: t(($) => $.lqi, { ns: "zigbee" }),
                accessorFn: ({ deviceState }) => deviceState.linkquality,
                cell: ({
                    row: {
                        original: { deviceState },
                    },
                }) => <Lqi value={deviceState.linkquality as number | undefined} />,
                filterFn: "inNumberRange",
                meta: { filterVariant: "range" },
            },
            {
                id: "last_seen",
                size: 120,
                header: t(($) => $.last_seen, { ns: "zigbee" }),
                accessorFn: ({ deviceState, lastSeenConfig }) => {
                    const lastTs = getLastSeenEpoch(deviceState.last_seen, lastSeenConfig);

                    // since now (last time table updated)
                    return lastTs ? Math.round((Date.now() - lastTs) / 1000 / 60) : undefined;
                },
                cell: ({
                    row: {
                        original: { deviceState, lastSeenConfig },
                    },
                }) => <LastSeen lastSeen={deviceState.last_seen} config={lastSeenConfig} fallback={t(($) => $.disabled, { ns: "common" })} />,
                // don't want to compare by minute (`accessorFn`), as that creates visual mismatches with `<LastSeen />`
                sortingFn: (rowA, rowB) => {
                    const a = getLastSeenEpoch(rowA.original.deviceState.last_seen, rowA.original.lastSeenConfig);
                    const b = getLastSeenEpoch(rowB.original.deviceState.last_seen, rowB.original.lastSeenConfig);

                    // @ts-expect-error undefined is fine
                    return a > b ? -1 : a < b ? 1 : 0;
                },
                enableGlobalFilter: false,
                filterFn: "inNumberRange",
                meta: { filterVariant: "range" },
            },
            {
                id: "availability",
                size: 125,
                header: t(($) => $.availability, { ns: "availability" }),
                accessorFn: ({ device, availabilityState, availabilityEnabledForDevice }) =>
                    t(
                        ($) =>
                            $[
                                device.disabled
                                    ? "disabled"
                                    : (availabilityEnabledForDevice ?? availabilityFeatureEnabled)
                                      ? availabilityState
                                      : "disabled"
                            ],
                        { ns: "availability" },
                    ),
                cell: ({
                    row: {
                        original: { device, availabilityState, availabilityEnabledForDevice },
                    },
                }) => (
                    <Availability
                        disabled={device.disabled}
                        availability={availabilityState}
                        availabilityEnabledForDevice={availabilityEnabledForDevice}
                        availabilityFeatureEnabled={availabilityFeatureEnabled}
                    />
                ),
                filterFn: "equals",
                meta: { filterVariant: "select", showFacetedOccurrences: true },
            },
            {
                id: "actions",
                size: 70,
                cell: ({
                    row: {
                        original: { device, groupMember, removeDeviceFromGroup },
                    },
                }) => (
                    <ConfirmButton<string>
                        onClick={async () => await removeDeviceFromGroup(device.ieee_address, groupMember.endpoint)}
                        className="btn btn-square btn-outline btn-error btn-sm"
                        title={t(($) => $.remove_from_group)}
                        modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                        modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </ConfirmButton>
                ),
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [sourceIdx, availabilityFeatureEnabled, t],
    );

    return useTable({
        id: "group-members",
        columns,
        data,
        sorting: [{ id: "friendly_name", desc: false }],
    });
}

export type UseGroupMembersTableReturn = ReturnType<typeof useGroupMembersTable>;
