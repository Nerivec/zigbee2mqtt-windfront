import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { t } from "i18next";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import store2 from "store2";
import Button from "../components/Button.js";
import DeviceTile from "../components/device/DeviceTile.js";
import GroupScenesTile from "../components/group/GroupScenesTile.js";
import DevicePeek from "../components/home-page/DevicePeek.js";
import Hero from "../components/home-page/Hero.js";
import RecentActivity from "../components/home-page/RecentActivity.js";
import { useColumnCount } from "../hooks/useColumnCount.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { HOME_SHOW_GROUP_SCENES_KEY, HOME_SHOW_RECENT_ACTIVITY_KEY } from "../localStoreConsts.js";
import { API_URLS, useAppStore } from "../store.js";
import type { Device, DeviceAvailability, DeviceState, Group, LastSeenConfig } from "../types.js";
import { getLastSeenEpoch } from "../utils.js";

export type HomePageDataCounters = {
    totalDevices: number;
    onlineDevices: number;
    disabledDevices: number;
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
}

export interface HomePageRecentActivityEntry {
    sourceIdx: number;
    device: Device;
    lastSeenTs: number;
    lastSeen: unknown;
    lastSeenConfig: LastSeenConfig;
    availability: DeviceAvailability;
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
    const [showRecentActivity, setShowRecentActivity] = useState<boolean>(store2.get(HOME_SHOW_RECENT_ACTIVITY_KEY, true));
    const [showGroupScenes, setShowGroupScenes] = useState<boolean>(store2.get(HOME_SHOW_GROUP_SCENES_KEY, true));
    const [selection, setSelection] = useState<HomePageSelection | undefined>(undefined);

    useEffect(() => {
        store2.set(HOME_SHOW_RECENT_ACTIVITY_KEY, showRecentActivity);
    }, [showRecentActivity]);

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
        let disabledDevices = 0;
        let totalInstances = 0;
        let onlineInstances = 0;
        let routers = 0;
        let endDevices = 0;
        let gpDevices = 0;
        let lowLqiDevices = 0;

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            totalInstances += 1;
            if (readyState[sourceIdx] === WebSocket.OPEN) {
                onlineInstances += 1;
            }

            const lastSeenConfig = bridgeInfo[sourceIdx].config.advanced.last_seen;
            const availabilityEnabled = bridgeInfo[sourceIdx].config.availability.enabled;

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

        return {
            counters: {
                totalDevices,
                onlineDevices,
                disabledDevices,
                totalInstances,
                onlineInstances,
                routers,
                endDevices,
                gpDevices,
                lowLqiDevices,
            },
            deviceData,
        };
    }, [devices, deviceStates, bridgeInfo, availability, readyState, handleTileClick]);

    const recentActivityEntries = useMemo(() => {
        const entries: HomePageRecentActivityEntry[] = [];

        // avoid unnecessary computing, will hide automatically since 0 length
        if (!showRecentActivity) {
            return entries;
        }

        for (const d of data.deviceData) {
            if (d.lastSeenConfig === "disable") {
                continue;
            }

            const lastSeenTs = getLastSeenEpoch(d.deviceState.last_seen, d.lastSeenConfig) ?? 0;

            entries.push({
                sourceIdx: d.sourceIdx,
                device: d.device,
                lastSeenTs,
                lastSeen: d.deviceState.last_seen,
                lastSeenConfig: d.lastSeenConfig,
                availability: d.deviceAvailability,
            });
        }

        return entries.sort((a, b) => b.lastSeenTs - a.lastSeenTs).slice(0, 10);
    }, [showRecentActivity, data.deviceData]);

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

    return (
        <>
            <NavBarContent>
                <span className="text-sm">{t(($) => $.show)}: </span>
                <Button<boolean>
                    className={`btn btn-outline btn-sm ${showRecentActivity ? "btn-active" : ""}`}
                    onClick={setShowRecentActivity}
                    item={!showRecentActivity}
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
                <Hero {...data.counters} lastActivity={recentActivityEntries[0]} />

                {recentActivityEntries.length > 0 && <RecentActivity entries={recentActivityEntries} />}

                <div className="divider m-0 mb-1" />

                {groupScenesData.length > 0 && (
                    <section className="pb-3 flex flex-row flex-wrap justify-center gap-2">
                        {groupScenesData.map((data) => (
                            <GroupScenesTile key={data.group.id} {...data} />
                        ))}
                    </section>
                )}

                <VirtuosoMasonry
                    useWindowScroll
                    columnCount={columnCount}
                    data={data.deviceData}
                    ItemContent={DeviceTile}
                    className="gap-2 select-none"
                />
                {selection && <DevicePeek selection={selection} onClose={() => setSelection(undefined)} />}
            </div>
        </>
    );
}
