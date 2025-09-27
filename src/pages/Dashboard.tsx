import { faArrowsUpToLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../components/Button.js";
import DashboardItem from "../components/dashboard-page/DashboardItem.js";
import TableSearch from "../components/table/TableSearch.js";
import { useColumnCount } from "../hooks/useColumnCount.js";
import { useTable } from "../hooks/useTable.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { AvailabilityState, Device, DeviceState, FeatureWithAnySubFeatures, LastSeenConfig } from "../types.js";
import { getLastSeenEpoch, toHex } from "../utils.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

export interface DashboardTableData {
    sourceIdx: number;
    device: Device;
    deviceState: DeviceState;
    deviceAvailability: AvailabilityState["state"] | "disabled";
    batteryLow: boolean | undefined;
    features: FeatureWithAnySubFeatures[];
    featureTypes: string[]; // for filtering purposes
    featureNames: string[]; // for filtering purposes
    lastSeenConfig: LastSeenConfig;
    removeDevice: (sourceIdx: number, id: string, force: boolean, block: boolean) => Promise<void>;
}

export default function Dashboard() {
    const { t } = useTranslation(["common", "zigbee"]);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const availability = useAppStore((state) => state.availability);
    const deviceDashbordFeatures = useAppStore((state) => state.deviceDashboardFeatures);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const devices = useAppStore((state) => state.devices);
    const columnCount = useColumnCount();

    const removeDevice = useCallback(async (sourceIdx: number, id: string, force: boolean, block: boolean): Promise<void> => {
        await sendMessage(sourceIdx, "bridge/request/device/remove", { id, force, block });
    }, []);

    const data = useMemo(() => {
        const elements: DashboardTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            const lastSeenConfig = bridgeInfo[sourceIdx].config.advanced.last_seen;
            const availabilityEnabled = bridgeInfo[sourceIdx].config.availability.enabled;

            for (const device of devices[sourceIdx]) {
                if (device.disabled || !device.supported || !device.definition) {
                    continue;
                }

                const dashboardFeatures = deviceDashbordFeatures[sourceIdx][device.ieee_address];

                if (!dashboardFeatures || dashboardFeatures.length === 0) {
                    continue;
                }

                const featureTypes = new Set<string>();
                const featureNames = new Set<string>();

                for (const feature of dashboardFeatures) {
                    if ("features" in feature && feature.features) {
                        // go only 1-level deep here, recursive could get expensive, should cover most cases
                        for (const subFeature of feature.features) {
                            if (subFeature.type) {
                                featureTypes.add(subFeature.type);
                            }

                            if (subFeature.name) {
                                featureNames.add(subFeature.name);
                            }
                        }

                        if (feature.type) {
                            featureTypes.add(feature.type);
                        }

                        // no name on light, switch, etc.
                    } else {
                        if (feature.type) {
                            featureTypes.add(feature.type);
                        }

                        if (feature.name) {
                            featureNames.add(feature.name);
                        }
                    }
                }

                const deviceState = deviceStates[sourceIdx][device.friendly_name] ?? {};
                let batteryLow: boolean | undefined;

                if (device.power_source === "Battery") {
                    batteryLow = false;

                    if ("battery" in deviceState) {
                        if ((deviceState.battery as number) < 20) {
                            batteryLow = true;
                        }
                    } else if ("battery_state" in deviceState) {
                        if (deviceState.battery_state === "low") {
                            batteryLow = true;
                        }
                    } else if ("battery_low" in deviceState) {
                        batteryLow = Boolean(deviceState.battery_low);
                    }
                }

                let deviceAvailability: DashboardTableData["deviceAvailability"] = "disabled";

                if (!device.disabled) {
                    const deviceAvailabilityConfig = bridgeInfo[sourceIdx].config.devices[device.ieee_address]?.availability;
                    const availabilityEnabledForDevice = deviceAvailabilityConfig != null ? !!deviceAvailabilityConfig : undefined;
                    deviceAvailability =
                        (availabilityEnabledForDevice ?? availabilityEnabled)
                            ? (availability[sourceIdx][device.friendly_name]?.state ?? "offline")
                            : "disabled";
                }

                elements.push({
                    sourceIdx,
                    device,
                    deviceState,
                    deviceAvailability,
                    batteryLow,
                    features: dashboardFeatures,
                    featureTypes: Array.from(featureTypes),
                    featureNames: Array.from(featureNames),
                    lastSeenConfig,
                    removeDevice,
                });
            }
        }

        return elements;
    }, [devices, deviceStates, deviceDashbordFeatures, bridgeInfo, availability, removeDevice]);

    const columns = useMemo<ColumnDef<DashboardTableData, unknown>[]>(
        () => [
            {
                id: "source",
                accessorFn: ({ sourceIdx }) => API_NAMES[sourceIdx],
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "friendly_name",
                header: t(($) => $.friendly_name),
                accessorFn: ({ device }) => `${device.friendly_name} ${device.description ?? ""}`,
                sortingFn: (rowA, rowB) => rowA.original.device.friendly_name.localeCompare(rowB.original.device.friendly_name),
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                    textFaceted: true,
                },
            },
            {
                id: "ieee_address",
                header: t(($) => $.ieee_address, { ns: "zigbee" }),
                accessorFn: ({ device }) => `${device.ieee_address} ${toHex(device.network_address, 4)} ${device.network_address}`,
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "type",
                header: t(($) => $.type, { ns: "zigbee" }),
                accessorFn: ({ device }) => t(($) => $.zigbee[device.type]),
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "state",
                header: t(($) => $.state),
                accessorFn: ({ deviceState }) => deviceState.state,
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "lqi",
                header: t(($) => $.lqi, { ns: "zigbee" }),
                accessorFn: ({ deviceState }) => deviceState.linkquality,
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                },
            },
            {
                id: "last_seen",
                header: t(($) => $.last_seen, { ns: "zigbee" }),
                accessorFn: ({ deviceState, lastSeenConfig }) => {
                    const lastTs = getLastSeenEpoch(deviceState.last_seen, lastSeenConfig);

                    // since now (last time table updated)
                    return lastTs ? Math.round((Date.now() - lastTs) / 1000 / 60) : undefined;
                },
                enableGlobalFilter: false,
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                    tooltip: t(($) => $.last_seen_filter_info),
                },
            },
            {
                id: "battery_low",
                header: t(($) => $.battery_low, { ns: "zigbee" }),
                accessorFn: ({ batteryLow }) => (batteryLow === undefined ? "N/A" : batteryLow),
                filterFn: "equals",
                meta: {
                    filterVariant: "boolean",
                },
            },
            {
                id: "feature_type",
                header: t(($) => $.feature_type),
                accessorFn: ({ featureTypes }) => featureTypes,
                filterFn: "arrIncludes",
                meta: {
                    filterVariant: "arrSelect",
                },
                enableGlobalFilter: false,
            },
            {
                id: "feature_name",
                header: t(($) => $.feature_name),
                accessorFn: ({ featureNames }) => featureNames,
                filterFn: "arrIncludes",
                meta: {
                    filterVariant: "arrSelect",
                },
                enableGlobalFilter: false,
            },
        ],
        [t],
    );

    const table = useTable({
        id: "dashboard-devices",
        columns,
        data,
        sorting: [{ id: "friendly_name", desc: false }],
    });
    const { rows } = table.table.getRowModel();

    return (
        <>
            <NavBarContent>
                <TableSearch {...table} />
            </NavBarContent>

            <div>
                {/* XXX: issues with going to zero items and back */}
                <VirtuosoMasonry
                    // XXX: issues with filtering, workaround, re-render when it changes, appears to be much faster too
                    key={`dashboard-${rows.length}-${table.globalFilter}`}
                    useWindowScroll
                    columnCount={columnCount}
                    data={rows}
                    ItemContent={DashboardItem}
                    className="gap-3"
                />
            </div>

            <div className="sticky z-9 bottom-0 pb-1 w-full flex flex-row justify-end sm:hidden">
                <Button
                    title={t(($) => $.scroll_to_top)}
                    className="btn btn-primary btn-square"
                    onClick={() => {
                        window.scrollTo(0, 0);
                    }}
                >
                    <FontAwesomeIcon icon={faArrowsUpToLine} />
                </Button>
            </div>
        </>
    );
}
