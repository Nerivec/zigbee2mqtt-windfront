import { faCircleInfo, faDownLong, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, lazy, memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import store2 from "store2";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import Button from "../components/Button.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import SelectField from "../components/form-fields/SelectField.js";
import type { NetworkRawDisplayType } from "../components/network-page/index.js";
import SourceDot from "../components/SourceDot.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { NETWORK_RAW_DISPLAY_TYPE_KEY } from "../localStoreConsts.js";
import { API_URLS, MULTI_INSTANCE, useAppStore } from "../store.js";
import { getValidSourceIdx } from "../utils.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

type UrlParams = {
    sourceIdx: `${number}`;
};

type NetworkTabProps = {
    sourceIdx: number;
};

type MapType = Zigbee2MQTTAPI["bridge/response/networkmap"]["type"];

const RawNetworkData = lazy(async () => await import("../components/network-page/RawNetworkData.js"));
const RawNetworkMap = lazy(async () => await import("../components/network-page/RawNetworkMap.js"));

const NetworkTab = memo(({ sourceIdx }: NetworkTabProps) => {
    const { t } = useTranslation(["network", "common"]);
    const networkMapIsLoading = useAppStore(useShallow((state) => state.networkMapIsLoading[sourceIdx]));
    const networkMap = useAppStore(useShallow((state) => state.networkMap[sourceIdx]));
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
        setNetworkMap(sourceIdx, undefined);
        setNetworkMapIsLoading(sourceIdx);
        await sendMessage(sourceIdx, "bridge/request/networkmap", { type: mapType, routes: enableRoutes });
    }, [sourceIdx, mapType, enableRoutes, setNetworkMap, setNetworkMapIsLoading]);

    const content = useMemo(() => {
        if (networkMapIsLoading) {
            return (
                <>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <span className="loading loading-infinity loading-xl" />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-2">{t("common:loading")}</div>
                </>
            );
        }

        if (networkMap) {
            switch (networkMap.type) {
                case "raw": {
                    return displayType === "data" ? (
                        <RawNetworkData sourceIdx={sourceIdx} map={networkMap.value} />
                    ) : (
                        <RawNetworkMap sourceIdx={sourceIdx} map={networkMap.value} />
                    );
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

        return (
            <div className="flex flex-col justify-center items-center gap-2">
                <p className="max-w-prose">{t("begin_info_type")}</p>
                <p className="max-w-prose">{t("begin_info_routes")}</p>
                <p className="max-w-prose">{t("begin_info_display")}</p>
            </div>
        );
    }, [sourceIdx, networkMap, networkMapIsLoading, displayType, t]);

    return (
        <>
            <div className="flex flex-row flex-wrap justify-center gap-3 mb-2">
                <SelectField name="type" label={t("type")} value={mapType} onChange={onMapTypeChange}>
                    <option value="raw">{t("raw")}</option>
                    <option value="graphviz">{t("graphviz")}</option>
                    <option value="plantuml">{t("plantuml")}</option>
                </SelectField>
                <CheckboxField name="enable_routes" label={t("enable_routes")} checked={enableRoutes} onChange={onEnableRoutesChange} />
                <fieldset className="fieldset self-end">
                    <Button
                        className="btn btn-outline btn-primary ms-3 me-6"
                        onClick={onRequestClick}
                        title={networkMap ? t("reload") : t("load")}
                        disabled={networkMapIsLoading}
                    >
                        {networkMap ? <FontAwesomeIcon icon={faSync} /> : <FontAwesomeIcon icon={faDownLong} />}
                        {networkMap ? t("reload") : t("load")}
                    </Button>
                </fieldset>
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
});

const isNavActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "menu-active" : undefined);

export default function NetworkPage() {
    const navigate = useNavigate();
    const { sourceIdx } = useParams<UrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);

    useEffect(() => {
        if (!sourceIdx || !validSourceIdx) {
            navigate("/network/0", { replace: true });
        }
    }, [sourceIdx, validSourceIdx, navigate]);

    return (
        <>
            <NavBarContent>
                {MULTI_INSTANCE && (
                    <div className="menu menu-horizontal flex-1">
                        {API_URLS.map((v, idx) => (
                            <li key={v}>
                                <NavLink to={`/network/${idx}`} className={isNavActive}>
                                    <SourceDot idx={idx} alwaysShowName />
                                </NavLink>
                            </li>
                        ))}
                    </div>
                )}
            </NavBarContent>

            <NetworkTab key={sourceIdx} sourceIdx={numSourceIdx} />
        </>
    );
}
