import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import store2 from "store2";
import DashboardHeader from "../components/dashboard-page/DashboardHeader.js";
import DashboardItem, { type DashboardItemProps } from "../components/dashboard-page/DashboardItem.js";
import { useColumnCount } from "../hooks/useColumnCount.js";
import { useSearch } from "../hooks/useSearch.js";
import {
    DASHBOARD_FILTER_FEATURE_PROPERTY_KEY,
    DASHBOARD_FILTER_FEATURE_TYPE_KEY,
    DASHBOARD_FILTER_FRIENDLY_NAME_KEY,
    DASHBOARD_FILTER_SHOW_END_DEVICES_KEY,
    DASHBOARD_FILTER_SHOW_ROUTERS_KEY,
    DASHBOARD_FILTER_SOURCE_KEY,
} from "../localStoreConsts.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

export default function Dashboard() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const deviceDashbordFeatures = useAppStore((state) => state.deviceDashboardFeatures);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const devices = useAppStore((state) => state.devices);
    const [searchTerm, normalizedSearchTerm, setSearchTerm] = useSearch(DASHBOARD_FILTER_FRIENDLY_NAME_KEY);
    const [showRouters, setShowRouters] = useState<boolean>(store2.get(DASHBOARD_FILTER_SHOW_ROUTERS_KEY, true));
    const [showEndDevices, setShowEndDevices] = useState<boolean>(store2.get(DASHBOARD_FILTER_SHOW_END_DEVICES_KEY, true));
    const [selectedType, setSelectedType] = useState<string>(store2.get(DASHBOARD_FILTER_FEATURE_TYPE_KEY, ""));
    const [selectedProperty, setSelectedProperty] = useState<string>(store2.get(DASHBOARD_FILTER_FEATURE_PROPERTY_KEY, ""));
    const [sourceFilter, setSourceFilter] = useState<string>(store2.get(DASHBOARD_FILTER_SOURCE_KEY, ""));
    const columnCount = useColumnCount();

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_SHOW_ROUTERS_KEY, showRouters);
    }, [showRouters]);

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_SHOW_END_DEVICES_KEY, showEndDevices);
    }, [showEndDevices]);

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_FEATURE_TYPE_KEY, selectedType);
    }, [selectedType]);

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_FEATURE_PROPERTY_KEY, selectedProperty);
    }, [selectedProperty]);

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_SOURCE_KEY, sourceFilter);
    }, [sourceFilter]);

    const renameDevice = useCallback(
        async (sourceIdx: number, from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: false,
            });
        },
        [sendMessage],
    );

    const removeDevice = useCallback(
        async (sourceIdx: number, id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const filteredData = useMemo(() => {
        const elements: DashboardItemProps["data"][] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            if (sourceFilter && sourceFilter !== `${sourceIdx} ${API_NAMES[sourceIdx]}`) {
                continue;
            }

            const lastSeenConfig = bridgeInfo[sourceIdx].config.advanced.last_seen;
            const homeassistantEnabled = bridgeInfo[sourceIdx].config.homeassistant.enabled;

            for (const device of devices[sourceIdx]) {
                if (device.disabled || !device.supported || !device.definition) {
                    continue;
                }

                if ((!showRouters && device.type === "Router") || (!showEndDevices && device.type === "EndDevice")) {
                    continue;
                }

                const dashboardFeatures = deviceDashbordFeatures[sourceIdx][device.ieee_address];

                if (!dashboardFeatures || dashboardFeatures.length === 0) {
                    continue;
                }

                if (selectedType !== "" && !dashboardFeatures.some((f) => f.type === selectedType)) {
                    continue;
                }

                // using name to compare to avoid multi-endpoint issues
                if (selectedProperty !== "" && !dashboardFeatures.some((f) => f.name === selectedProperty)) {
                    continue;
                }

                if (normalizedSearchTerm.length > 0 && !device.friendly_name.toLowerCase().includes(normalizedSearchTerm)) {
                    continue;
                }

                elements.push({
                    sourceIdx,
                    device,
                    deviceState: deviceStates[sourceIdx][device.friendly_name] ?? {},
                    features: dashboardFeatures,
                    lastSeenConfig,
                    homeassistantEnabled,
                    renameDevice,
                    removeDevice,
                });
            }
        }

        elements.sort((elA, elB) => elA.device.ieee_address.localeCompare(elB.device.ieee_address));

        return elements;
    }, [
        devices,
        deviceStates,
        deviceDashbordFeatures,
        bridgeInfo,
        normalizedSearchTerm,
        showRouters,
        showEndDevices,
        selectedType,
        selectedProperty,
        sourceFilter,
        renameDevice,
        removeDevice,
    ]);

    return (
        <>
            <DashboardHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showRouters={showRouters}
                setShowRouters={setShowRouters}
                showEndDevices={showEndDevices}
                setShowEndDevices={setShowEndDevices}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedProperty={selectedProperty}
                setSelectedProperty={setSelectedProperty}
                sourceFilter={sourceFilter}
                setSourceFilter={setSourceFilter}
            />
            <div>
                {/* XXX: issues with going to zero items and back */}
                {filteredData.length > 0 && (
                    <VirtuosoMasonry
                        // XXX: issues with filtering, workaround, re-render when it changes
                        key={`dashboard-${normalizedSearchTerm}-${showRouters}-${showEndDevices}-${selectedType}-${selectedProperty}-${filteredData.length}`}
                        useWindowScroll
                        columnCount={columnCount}
                        data={filteredData}
                        ItemContent={DashboardItem}
                        className="gap-3"
                    />
                )}
            </div>
        </>
    );
}
