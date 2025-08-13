import { faCircleInfo, faDownLong, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, lazy, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import Button from "../components/Button.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import SelectField from "../components/form-fields/SelectField.js";
import type { NetworkRawDisplayType } from "../components/network-page/index.js";
import { NETWORK_RAW_DISPLAY_TYPE_KEY } from "../localStoreConsts.js";
import { useAppStore } from "../store.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

type MapType = Zigbee2MQTTAPI["bridge/response/networkmap"]["type"];

const RawNetworkData = lazy(async () => await import("../components/network-page/RawNetworkData.js"));
const RawNetworkMap = lazy(async () => await import("../components/network-page/RawNetworkMap.js"));

export default function NetworkPage() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["network", "common"]);
    const networkMapIsLoading = useAppStore((state) => state.networkMapIsLoading);
    const networkMap = useAppStore((state) => state.networkMap);
    const setNetworkMap = useAppStore((state) => state.setNetworkMap);
    const setNetworkMapIsLoading = useAppStore((state) => state.setNetworkMapIsLoading);
    const [mapType, setMapType] = useState<MapType>("raw");
    const [enableRoutes, setEnableRoutes] = useState(false);
    const [displayType, setDisplayType] = useState<NetworkRawDisplayType>(store2.get(NETWORK_RAW_DISPLAY_TYPE_KEY, "data"));

    const onMapTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value) {
            setMapType(event.target.value as MapType);
        }
    }, []);

    const onDisplayTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value) {
            store2.set(NETWORK_RAW_DISPLAY_TYPE_KEY, event.target.value);
            setDisplayType(event.target.value as NetworkRawDisplayType);
        }
    }, []);

    const onEnableRoutesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setEnableRoutes(event.target.checked);
    }, []);

    const onRequestClick = useCallback(async () => {
        setNetworkMap(undefined);
        setNetworkMapIsLoading();
        await sendMessage("bridge/request/networkmap", { type: mapType, routes: enableRoutes });
    }, [mapType, enableRoutes, setNetworkMap, setNetworkMapIsLoading, sendMessage]);

    const content = useMemo(() => {
        if (networkMapIsLoading) {
            return (
                <>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <span className="loading loading-infinity loading-xl" />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-2">{t("loading")}</div>
                </>
            );
        }

        if (networkMap) {
            switch (networkMap.type) {
                case "raw": {
                    return displayType === "data" ? <RawNetworkData map={networkMap.value} /> : <RawNetworkMap map={networkMap.value} />;
                }
                case "graphviz": {
                    return (
                        <>
                            <div className="alert alert-info alert-soft mb-3" role="alert">
                                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                                {t("copy_paste_on")}
                                <a href="https://dreampuf.github.io/GraphvizOnline" target="_blank" rel="noreferrer" className="link link-hover">
                                    https://dreampuf.github.io/GraphvizOnline
                                </a>
                                <a href="https://edotor.net/" target="_blank" rel="noreferrer" className="link link-hover">
                                    https://edotor.net/
                                </a>
                            </div>
                            <textarea className="textarea w-full" rows={5} readOnly value={networkMap.value} />
                        </>
                    );
                }
                case "plantuml": {
                    return (
                        <>
                            <div className="alert alert-info alert-soft mb-3" role="alert">
                                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                                {t("copy_paste_on")}
                                <a href="https://editor.plantuml.com/uml/" target="_blank" rel="noreferrer" className="link link-hover">
                                    https://editor.plantuml.com/uml/
                                </a>
                                <a href="https://www.planttext.com/" target="_blank" rel="noreferrer" className="link link-hover">
                                    https://www.planttext.com/
                                </a>
                            </div>
                            <textarea className="textarea w-full" rows={5} readOnly value={networkMap.value} />
                        </>
                    );
                }
            }
        }

        return null;
    }, [networkMap, networkMapIsLoading, displayType, t]);

    return (
        <>
            <div className="flex flex-row justify-center gap-3 mb-2">
                <SelectField name="type" label={t("type")} value={mapType} onChange={onMapTypeChange}>
                    <option value="raw">{t("raw")}</option>
                    <option value="graphviz">{t("graphviz")}</option>
                    <option value="plantuml">{t("plantuml")}</option>
                </SelectField>
                <CheckboxField name="enable_routes" label={t("enable_routes")} checked={enableRoutes} onChange={onEnableRoutesChange} />
                <Button
                    className="btn btn-primary btn-square self-center ms-3 me-6"
                    onClick={onRequestClick}
                    title={networkMap ? t("reload") : t("load")}
                    disabled={networkMapIsLoading}
                >
                    {networkMap ? <FontAwesomeIcon icon={faSync} /> : <FontAwesomeIcon icon={faDownLong} />}
                </Button>
                {mapType === "raw" && (
                    <SelectField name="display_type" label={t("display_type")} value={displayType} onChange={onDisplayTypeChange}>
                        <option value="data">{t("data")}</option>
                        <option value="map">{t("map")}</option>
                    </SelectField>
                )}
            </div>

            {content}
        </>
    );
}
