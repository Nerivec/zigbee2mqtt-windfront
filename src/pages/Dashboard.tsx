import NiceModal from "@ebay/nice-modal-react";
import { faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/Button.js";
import DashboardFeatureWrapper from "../components/dashboard-page/DashboardFeatureWrapper.js";
import { getDashboardFeatures } from "../components/dashboard-page/index.js";
import DeviceCard from "../components/device/DeviceCard.js";
import DeviceControlEditName from "../components/device/DeviceControlEditName.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import { RemoveDeviceModal } from "../components/modal/components/RemoveDeviceModal.js";
import { useAppSelector } from "../hooks/useApp.js";
import type { FeatureWithAnySubFeatures } from "../types.js";

export default function Dashboard() {
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeConfig = useAppSelector((state) => state.bridgeInfo.config);
    const devices = useAppSelector((state) => state.devices);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("zigbee");
    const [filterValue, setFilterValue] = useState<string>("");

    const renameDevice = useCallback(
        async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: false,
            });
        },
        [sendMessage],
    );

    const removeDevice = useCallback(
        async (id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const filteredDevices = useMemo(() => {
        const filteredDevices: JSX.Element[] = [];

        for (const device of devices) {
            if (!device.disabled && device.supported && (!filterValue || device.friendly_name.toLowerCase().includes(filterValue.toLowerCase()))) {
                const deviceState = deviceStates[device.friendly_name] ?? {};
                const filteredFeatures: FeatureWithAnySubFeatures[] = [];

                if (device.definition?.exposes) {
                    for (const feature of device.definition.exposes) {
                        const validFeature = getDashboardFeatures(feature, deviceState);

                        if (validFeature) {
                            filteredFeatures.push(validFeature);

                            // limit size of cards
                            if (filteredFeatures.length === 10) {
                                break;
                            }
                        }
                    }
                }

                if (filteredFeatures.length > 0) {
                    filteredDevices.push(
                        <ul className="flex-auto basis-sm list bg-base-200 rounded-box shadow-md" key={device.ieee_address}>
                            <DeviceCard
                                features={filteredFeatures}
                                device={device}
                                deviceState={deviceState}
                                onChange={async (value) =>
                                    await sendMessage<"{friendlyNameOrId}/set">(
                                        // @ts-expect-error templated API endpoint
                                        `${device.ieee_address}/set`,
                                        value,
                                    )
                                }
                                onRead={async (value) =>
                                    await sendMessage<"{friendlyNameOrId}/get">(
                                        // @ts-expect-error templated API endpoint
                                        `${device.ieee_address}/get`,
                                        value,
                                    )
                                }
                                featureWrapperClass={DashboardFeatureWrapper}
                                lastSeenConfig={bridgeConfig.advanced.last_seen}
                            >
                                <div className="join join-vertical lg:join-horizontal">
                                    <DeviceControlEditName
                                        name={device.friendly_name}
                                        renameDevice={renameDevice}
                                        homeassistantEnabled={bridgeConfig.homeassistant.enabled}
                                        style="btn-primary btn-square btn-sm join-item"
                                    />
                                    <Button<void>
                                        onClick={async () => await NiceModal.show(RemoveDeviceModal, { device, removeDevice })}
                                        className="btn btn-error btn-square btn-sm join-item"
                                        title={t("remove_device")}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </div>
                            </DeviceCard>
                        </ul>,
                    );
                }
            }
        }

        return filteredDevices;
    }, [
        devices,
        deviceStates,
        bridgeConfig.advanced.last_seen,
        bridgeConfig.homeassistant.enabled,
        sendMessage,
        removeDevice,
        renameDevice,
        t,
        filterValue,
    ]);

    return (
        <>
            <div className="flex flex-row justify-center items-center gap-3 mb-3">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                <label className="input w-64">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <DebouncedInput
                        className=""
                        type="search"
                        onChange={(value) => setFilterValue(value.toString())}
                        placeholder={t("common:search")}
                        value={filterValue}
                        disabled={filteredDevices.length === 0}
                    />
                    <kbd
                        className="kbd kbd-sm cursor-pointer"
                        onClick={() => setFilterValue("")}
                        onKeyUp={(e) => {
                            if (e.key === "enter") {
                                setFilterValue("");
                            }
                        }}
                        title={t("common:clear")}
                    >
                        x
                    </kbd>
                </label>
            </div>
            <div className="flex flex-row flex-wrap justify-between items-stretch gap-3">{filteredDevices}</div>
        </>
    );
}
