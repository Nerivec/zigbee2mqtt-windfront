import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { t } from "i18next";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import store2 from "store2";
import Button from "../components/Button.js";
import DeviceTile from "../components/device/DeviceTile.js";
import GroupScenesTile from "../components/group/GroupScenesTile.js";
import Activity from "../components/home-page/Activity.js";
import DevicePeek from "../components/home-page/DevicePeek.js";
import Hero from "../components/home-page/Hero.js";
import { QuickFilter } from "../components/home-page/index.js";
import { useColumnCount } from "../hooks/useColumnCount.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { HOME_QUICK_FILTER_KEY, HOME_SHOW_ACTIVITY_KEY, HOME_SHOW_GROUP_SCENES_KEY } from "../localStoreConsts.js";
import { API_URLS, RECENT_ACTIVITY_FEED_LIMIT, useAppStore } from "../store.js";
import type { Device, DeviceAvailability, DeviceState, Group, LastSeenConfig } from "../types.js";

export type HomePageDataCounters = {
    totalDevices: number;
    onlineDevices: number;
    maybeOnlineDevices: number;
    disabledDevices: number;
    anyAvailabilityEnabled: boolean;
    totalInstances: number;
    onlineInstances: number;
    routers: number;
    endDevices: number;
    gpDevices: number;
    lowLqiDevices: number;
};

export type HomePageDeviceData = {
    sourceIdx: number;
    device: Device;
    deviceState: DeviceState;
    deviceAvailability: DeviceAvailability;
    lastSeenConfig: LastSeenConfig;
    onClick: (sourceIdx: number, device: Device, anchor: HTMLElement) => void;
};

export interface HomePageData {
    counters: HomePageDataCounters;
    deviceData: HomePageDeviceData[];
    filteredDeviceData: HomePageDeviceData[];
}

export interface HomePageGroupWithScenesEntry {
    sourceIdx: number;
    group: Group;
}

export type HomePageSelection = {
    anchor: HTMLElement;
} & Pick<HomePageDeviceData, "sourceIdx" | "device">;

export default function HomePage(): JSX.Element {
    const readyState = useAppStore((state) => state.readyStates);
    const groups = useAppStore((state) => state.groups);
    const devices = useAppStore((state) => state.devices);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const availability = useAppStore((state) => state.availability);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const columnCount = useColumnCount();
    const [quickFilter, setQuickFilter] = useState<readonly [QuickFilter, unknown] | null>(store2.get(HOME_QUICK_FILTER_KEY, null));
    const [showActivity, setShowActivity] = useState<boolean>(store2.get(HOME_SHOW_ACTIVITY_KEY, true));
    const [showGroupScenes, setShowGroupScenes] = useState<boolean>(store2.get(HOME_SHOW_GROUP_SCENES_KEY, true));
    const [selection, setSelection] = useState<HomePageSelection | undefined>(undefined);

    useEffect(() => {
        if (quickFilter == null) {
            store2.remove(HOME_QUICK_FILTER_KEY);
        } else {
            store2.set(HOME_QUICK_FILTER_KEY, quickFilter);
        }
    }, [quickFilter]);

    useEffect(() => {
        store2.set(HOME_SHOW_ACTIVITY_KEY, showActivity);
    }, [showActivity]);

    useEffect(() => {
        store2.set(HOME_SHOW_GROUP_SCENES_KEY, showGroupScenes);
    }, [showGroupScenes]);

    const handleTileClick = useCallback((sourceIdx: number, device: Device, anchor: HTMLElement) => {
        setSelection((prev) => {
            return prev?.device.ieee_address === device.ieee_address ? undefined : { anchor, sourceIdx, device };
        });
    }, []);

    const data: HomePageData = useMemo(() => {
        const deviceData: HomePageData["deviceData"] = [];
        let totalDevices = 0;
        let onlineDevices = 0;
        let maybeOnlineDevices = 0;
        let disabledDevices = 0;
        let totalInstances = 0;
        let onlineInstances = 0;
        let routers = 0;
        let endDevices = 0;
        let gpDevices = 0;
        let lowLqiDevices = 0;
        let anyAvailabilityEnabled = 0;

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            totalInstances += 1;
            if (readyState[sourceIdx] === WebSocket.OPEN) {
                onlineInstances += 1;
            }

            const lastSeenConfig = bridgeInfo[sourceIdx].config.advanced.last_seen;
            const availabilityEnabled = bridgeInfo[sourceIdx].config.availability.enabled;

            if (availabilityEnabled) {
                anyAvailabilityEnabled += 1;
            }

            for (const device of devices[sourceIdx]) {
                if (device.type === "Coordinator") {
                    continue;
                }

                switch (device.type) {
                    case "Router":
                        routers += 1;
                        break;
                    case "EndDevice":
                        endDevices += 1;
                        break;
                    case "GreenPower":
                        gpDevices += 1;
                        break;
                }

                const deviceState = deviceStates[sourceIdx][device.friendly_name] ?? {};
                let deviceAvailability: DeviceAvailability = "disabled";

                if (!device.disabled) {
                    totalDevices += 1;
                    const deviceAvailabilityConfig = bridgeInfo[sourceIdx].config.devices[device.ieee_address]?.availability;
                    const availabilityEnabledForDevice = deviceAvailabilityConfig != null ? !!deviceAvailabilityConfig : undefined;
                    deviceAvailability =
                        (availabilityEnabledForDevice ?? availabilityEnabled)
                            ? (availability[sourceIdx][device.friendly_name]?.state ?? "offline")
                            : "disabled";

                    if (deviceAvailability === "online") {
                        onlineDevices += 1;
                    } else if (deviceAvailability === "disabled") {
                        onlineDevices += 1;
                        maybeOnlineDevices += 1;
                    }
                } else {
                    disabledDevices += 1;
                }

                if (typeof deviceState.linkquality === "number" && deviceState.linkquality < 50) {
                    lowLqiDevices += 1;
                }

                deviceData.push({
                    sourceIdx,
                    device,
                    deviceState,
                    deviceAvailability,
                    lastSeenConfig,
                    onClick: handleTileClick,
                });
            }
        }

        deviceData.sort((dA, dB) => dA.device.friendly_name.localeCompare(dB.device.friendly_name));

        let filteredDeviceData: HomePageData["deviceData"] = [];

        if (quickFilter != null) {
            switch (quickFilter[0]) {
                case QuickFilter.Disabled: {
                    filteredDeviceData = deviceData.filter((d) => d.device.disabled === quickFilter[1]);
                    break;
                }
                case QuickFilter.Availability: {
                    filteredDeviceData = deviceData.filter((d) => d.deviceAvailability === quickFilter[1]);
                    break;
                }
                case QuickFilter.Type: {
                    filteredDeviceData = deviceData.filter((d) => d.device.type === quickFilter[1]);
                    break;
                }
                case QuickFilter.Lqi: {
                    filteredDeviceData = deviceData.filter(
                        (d) => typeof d.deviceState.linkquality === "number" && d.deviceState.linkquality < (quickFilter[1] as number),
                    );
                    break;
                }
            }
        } else {
            filteredDeviceData = deviceData;
        }

        return {
            counters: {
                totalDevices,
                onlineDevices,
                maybeOnlineDevices,
                disabledDevices,
                anyAvailabilityEnabled: anyAvailabilityEnabled > 0,
                totalInstances,
                onlineInstances,
                routers,
                endDevices,
                gpDevices,
                lowLqiDevices,
            },
            deviceData,
            filteredDeviceData,
        };
    }, [devices, deviceStates, bridgeInfo, availability, readyState, quickFilter, handleTileClick]);

    const groupScenesData = useMemo(() => {
        const elements: HomePageGroupWithScenesEntry[] = [];

        // avoid unnecessary computing, will hide automatically since 0 length
        if (!showGroupScenes) {
            return elements;
        }

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const group of groups[sourceIdx]) {
                if (group.scenes.length === 0) {
                    continue;
                }

                elements.push({ sourceIdx, group });
            }
        }

        return elements;
    }, [showGroupScenes, groups]);

    const maxActivityRows = Math.min(RECENT_ACTIVITY_FEED_LIMIT, data.counters.totalDevices);

    return (
        <>
            <NavBarContent>
                <span className="text-sm">{t(($) => $.show)}: </span>
                <Button<boolean>
                    className={`btn btn-outline btn-sm ${showActivity ? "btn-active" : ""}`}
                    onClick={setShowActivity}
                    item={!showActivity}
                >
                    {t(($) => $.recent_activity)}
                </Button>
                <Button<boolean>
                    className={`btn btn-outline btn-sm ${showGroupScenes ? "btn-active" : ""}`}
                    onClick={setShowGroupScenes}
                    item={!showGroupScenes}
                >
                    {t(($) => $.group_scenes)}
                </Button>
            </NavBarContent>

            <div className="flex flex-col mb-5">
                <Hero {...data.counters} setQuickFilter={setQuickFilter} quickFilter={quickFilter} />

                {showActivity && <Activity devices={devices} maxRows={maxActivityRows} />}

                <div className="divider m-0 mb-1" />

                {groupScenesData.length > 0 && (
                    <section className="mb-4 flex flex-row flex-wrap justify-center gap-2">
                        {groupScenesData.map((data) => (
                            <GroupScenesTile key={data.group.id} {...data} />
                        ))}
                    </section>
                )}

                <VirtuosoMasonry
                    key={`device-tiles-${quickFilter?.[0]}-${quickFilter?.[1]}`}
                    useWindowScroll
                    columnCount={columnCount}
                    data={data.filteredDeviceData}
                    ItemContent={DeviceTile}
                    className="gap-2 select-none"
                />
                {selection && <DevicePeek selection={selection} onClose={() => setSelection(undefined)} />}
            </div>
        </>
    );
}
