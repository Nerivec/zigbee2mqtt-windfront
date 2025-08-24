import type { ColumnDef } from "@tanstack/react-table";
import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardItem from "../components/dashboard-page/DashboardItem.js";
import TableHeader from "../components/table/TableHeader.js";
import { useColumnCount } from "../hooks/useColumnCount.js";
import { useTable } from "../hooks/useTable.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { Device, DeviceState, FeatureWithAnySubFeatures, LastSeenConfig } from "../types.js";
import { convertLastSeenToDate, toHex } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

export interface DashboardTableData {
    sourceIdx: number;
    device: Device;
    deviceState: DeviceState;
    batteryLow: boolean | undefined;
    features: FeatureWithAnySubFeatures[];
    featureTypes: string[]; // for filtering purposes
    featureNames: string[]; // for filtering purposes
    lastSeenConfig: LastSeenConfig;
    removeDevice: (sourceIdx: number, id: string, force: boolean, block: boolean) => Promise<void>;
}

export default function Dashboard() {
    const { t } = useTranslation(["common", "zigbee"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const deviceDashbordFeatures = useAppStore((state) => state.deviceDashboardFeatures);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const devices = useAppStore((state) => state.devices);
    const columnCount = useColumnCount();

    const removeDevice = useCallback(
        async (sourceIdx: number, id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const data = useMemo(() => {
        const elements: DashboardTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            const lastSeenConfig = bridgeInfo[sourceIdx].config.advanced.last_seen;

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

                elements.push({
                    sourceIdx,
                    device,
                    deviceState,
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
    }, [devices, deviceStates, deviceDashbordFeatures, bridgeInfo, removeDevice]);

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
                header: t("friendly_name"),
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
                header: t("zigbee:ieee_address"),
                accessorFn: ({ device }) => `${device.ieee_address} ${toHex(device.network_address, 4)} ${device.network_address}`,
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "type",
                header: t("zigbee:type"),
                accessorFn: ({ device }) => t(`zigbee:${device.type}`),
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "state",
                header: t("state"),
                accessorFn: ({ deviceState }) => deviceState.state,
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "lqi",
                header: t("zigbee:lqi"),
                accessorFn: ({ deviceState }) => deviceState.linkquality,
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                },
            },
            {
                id: "last_seen",
                header: t("zigbee:last_seen"),
                accessorFn: ({ deviceState, lastSeenConfig }) => {
                    const lastTs = convertLastSeenToDate(deviceState.last_seen, lastSeenConfig)?.getTime();

                    // since now (last time table updated)
                    return lastTs ? Math.round((Date.now() - lastTs) / 1000 / 60) : undefined;
                },
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                    tooltip: t("last_seen_filter_info"),
                },
            },
            {
                id: "battery_low",
                header: t("zigbee:battery_low"),
                accessorFn: ({ batteryLow }) => (batteryLow === undefined ? "N/A" : batteryLow),
                filterFn: "equals",
                meta: {
                    filterVariant: "boolean",
                },
            },
            {
                id: "feature_type",
                header: t("feature_type"),
                accessorFn: ({ featureTypes }) => featureTypes,
                filterFn: "arrIncludes",
                meta: {
                    filterVariant: "arrSelect",
                },
                enableGlobalFilter: false,
            },
            {
                id: "feature_name",
                header: t("feature_name"),
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
            <TableHeader {...table} noColumn />

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
        </>
    );
}
