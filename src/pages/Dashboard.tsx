import { faClose, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import Button from "../components/Button.js";
import DashboardItem, { type DashboardItemProps } from "../components/dashboard-page/DashboardItem.js";
import { isValidForDashboard } from "../components/dashboard-page/index.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import { useColumnCount } from "../hooks/useColumnCount.js";
import { DASHBOARD_FILTER_KEY } from "../localStoreConsts.js";
import { API_URLS, useAppStore } from "../store.js";
import { filterExposes } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

export default function Dashboard() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const devices = useAppStore((state) => state.devices);
    const { t } = useTranslation(["zigbee", "settings"]);
    const [filterValue, setFilterValue] = useState(store2.get(DASHBOARD_FILTER_KEY, ""));
    const columnCount = useColumnCount();

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_KEY, filterValue);
    }, [filterValue]);

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
            const lastSeenConfig = bridgeInfo[sourceIdx].config.advanced.last_seen;
            const homeassistantEnabled = bridgeInfo[sourceIdx].config.homeassistant.enabled;

            for (const device of devices[sourceIdx]) {
                if (
                    !device.disabled &&
                    device.supported &&
                    (!filterValue || device.friendly_name.toLowerCase().includes(filterValue.toLowerCase())) &&
                    device.definition
                ) {
                    const filteredFeatures = filterExposes(device.definition.exposes, isValidForDashboard);

                    if (filteredFeatures.length > 0) {
                        elements.push({
                            sourceIdx,
                            device,
                            deviceState: deviceStates[sourceIdx][device.friendly_name] ?? {},
                            features: filteredFeatures,
                            lastSeenConfig,
                            homeassistantEnabled,
                            renameDevice,
                            removeDevice,
                        });
                    }
                }
            }
        }

        elements.sort((elA, elB) => elA.device.ieee_address!.localeCompare(elB.device.ieee_address!));

        return elements;
    }, [devices, deviceStates, bridgeInfo, filterValue, renameDevice, removeDevice]);

    return (
        <>
            <div className="flex flex-row justify-center items-center gap-3 mb-3">
                <div className="join">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                    <label className="input w-64 join-item">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <DebouncedInput
                            className=""
                            type="search"
                            onChange={(value) => setFilterValue(value.toString())}
                            placeholder={t("common:search")}
                            value={filterValue}
                        />
                    </label>
                    <Button item="" onClick={setFilterValue} className="btn btn-square join-item" title={t("common:clear")}>
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
            </div>
            <div>
                <VirtuosoMasonry useWindowScroll columnCount={columnCount} data={filteredData} ItemContent={DashboardItem} className="gap-3" />
            </div>
        </>
    );
}
