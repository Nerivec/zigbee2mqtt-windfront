import { flexRender } from "@tanstack/react-table";
import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import GroupMembers from "../src/components/group-page/GroupMembers.js";
import GroupMembersList from "../src/components/group-page/GroupMembersList.js";
import {
    type GroupMembersTableData,
    type UseGroupMembersTableReturn,
    useGroupMembersTable,
} from "../src/components/group-page/useGroupMembersTable.js";
import { GROUP_MEMBERS_VIEW_KEY } from "../src/localStoreConsts.js";
import type { Device, Group } from "../src/types.js";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        // `$` is the namespace object: proxy it so any key resolves to its own name
        t: (key: (arg: Record<string, string>) => string) => key(new Proxy({}, { get: (_target, prop) => String(prop) })),
        i18n: { language: "en" },
    }),
}));

// functional mock: flatten the virtualized table into a plain table so column defs and cells are still exercised
vi.mock("../src/components/table/Table.js", () => ({
    default: ({
        table,
    }: {
        table: {
            getRowModel(): {
                rows: { id: string; getVisibleCells: () => { id: string; column: { columnDef: { cell?: unknown } }; getContext: () => unknown }[] }[];
            };
        };
    }) => (
        <table>
            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell ?? "", cell.getContext())}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    ),
}));

vi.mock("@virtuoso.dev/masonry", () => ({
    VirtuosoMasonry: () => <div data-testid="masonry" />,
}));

const makeDevice = (ieee: string, friendlyName: string): Device => ({
    ieee_address: ieee,
    friendly_name: friendlyName,
    network_address: 1000,
    type: "EndDevice",
    power_source: "Mains (single phase)",
    supported: true,
    disabled: false,
    interview_state: "SUCCESSFUL",
    definition: {
        model: "MODEL-1",
        vendor: "Vendor",
        description: "test bulb",
        exposes: [],
    },
});

const makeMember = (device: Device, endpoint: number): GroupMembersTableData => ({
    sourceIdx: 0,
    groupMember: { ieee_address: device.ieee_address, endpoint },
    device,
    deviceState: { linkquality: 120, last_seen: "2024-01-01T00:00:00Z" },
    deviceAvailability: "online",
    availabilityState: "online",
    availabilityEnabledForDevice: undefined,
    lastSeenConfig: "ISO_8601",
    removeDeviceFromGroup: async () => {},
    setDeviceState: async () => {},
});

// builds the shared table the same way GroupMembers does, exposing it for assertions
let membersTable: UseGroupMembersTableReturn;

const Harness = ({ data }: { data: GroupMembersTableData[] }) => {
    membersTable = useGroupMembersTable({ sourceIdx: 0, data });

    return (
        <MemoryRouter>
            <GroupMembersList table={membersTable} />
        </MemoryRouter>
    );
};

const makeGroup = (): Group => ({
    id: 1,
    friendly_name: "test group",
    members: [
        { ieee_address: "0x000000000000000a", endpoint: 11 },
        { ieee_address: "0x000000000000000b", endpoint: 1 },
    ],
});

describe("GroupMembersList", () => {
    afterEach(cleanup);

    const deviceA = makeDevice("0x000000000000000a", "kitchen_bulb");
    const deviceB = makeDevice("0x000000000000000b", "hall_bulb");
    const data = [makeMember(deviceA, 11), makeMember(deviceB, 1)];

    it("renders one row per group member", () => {
        render(<Harness data={data} />);

        expect(screen.getByText("kitchen_bulb")).toBeTruthy();
        expect(screen.getByText("hall_bulb")).toBeTruthy();
    });

    it("renders the member endpoint and model information", () => {
        render(<Harness data={data} />);

        expect(screen.getAllByText("11").length).toBeGreaterThan(0);
        expect(screen.getAllByText("1").length).toBeGreaterThan(0);
        expect(screen.getAllByText("MODEL-1").length).toBe(2);
    });

    it("renders a remove-from-group action per member", () => {
        render(<Harness data={data} />);

        expect(document.querySelectorAll('[data-tip="remove_from_group"]').length).toBe(2);
    });

    it("applies the shared global filter to the table rows", () => {
        render(<Harness data={data} />);

        act(() => {
            membersTable.table.setGlobalFilter("kitchen");
        });

        expect(screen.getByText("kitchen_bulb")).toBeTruthy();
        expect(screen.queryByText("hall_bulb")).toBeNull();
    });
});

describe("GroupMembers view toggle", () => {
    afterEach(() => {
        cleanup();
        localStorage.removeItem(GROUP_MEMBERS_VIEW_KEY);
    });

    const devices = [makeDevice("0x000000000000000a", "kitchen_bulb"), makeDevice("0x000000000000000b", "hall_bulb")];

    const renderMembers = () =>
        render(
            <MemoryRouter>
                <GroupMembers sourceIdx={0} devices={devices} group={makeGroup()} />
            </MemoryRouter>,
        );

    it("defaults to the cards view and switches to list, persisting the choice", () => {
        const { container } = renderMembers();

        // cards view: masonry mock rendered, no table
        expect(container.querySelector('[data-testid="masonry"]')).toBeTruthy();
        expect(container.querySelector("table")).toBeNull();

        act(() => {
            container.querySelector<HTMLButtonElement>('[aria-label="view_list"]')?.click();
        });

        expect(container.querySelector("table")).toBeTruthy();
        expect(localStorage.getItem(GROUP_MEMBERS_VIEW_KEY)).toBe(JSON.stringify("list"));

        act(() => {
            container.querySelector<HTMLButtonElement>('[aria-label="view_cards"]')?.click();
        });

        expect(localStorage.getItem(GROUP_MEMBERS_VIEW_KEY)).toBe(JSON.stringify("cards"));
    });
});
