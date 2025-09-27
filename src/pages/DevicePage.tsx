import {
    faArrowsSpin,
    faBug,
    faCog,
    faCogs,
    faDownLong,
    faInfo,
    faLink,
    faObjectGroup,
    faReceipt,
    faWandMagic,
    faWandSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import HeaderDeviceSelector from "../components/device-page/HeaderDeviceSelector.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { useAppStore } from "../store.js";
import type { Device } from "../types.js";
import { getValidSourceIdx } from "../utils.js";

export type TabName =
    | "info"
    | "bind"
    | "state"
    | "exposes"
    | "clusters"
    | "reporting"
    | "settings"
    | "settings-specific"
    | "dev-console"
    | "groups"
    | "scene";

type DevicePageUrlParams = {
    sourceIdx: `${number}`;
    deviceId: string;
    tab?: TabName;
};

const BindTab = lazy(async () => await import("../components/device-page/tabs/Bind.js"));
const ClustersTab = lazy(async () => await import("../components/device-page/tabs/Clusters.js"));
const DevConsoleTab = lazy(async () => await import("../components/device-page/tabs/DevConsole.js"));
const DeviceInfoTab = lazy(async () => await import("../components/device-page/tabs/DeviceInfo.js"));
const DeviceSettingsTab = lazy(async () => await import("../components/device-page/tabs/DeviceSettings.js"));
const DeviceSpecificSettingsTab = lazy(async () => await import("../components/device-page/tabs/DeviceSpecificSettings.js"));
const ExposesTab = lazy(async () => await import("../components/device-page/tabs/Exposes.js"));
const GroupsTab = lazy(async () => await import("../components/device-page/tabs/Groups.js"));
const ReportingTab = lazy(async () => await import("../components/device-page/tabs/Reporting.js"));
const SceneTab = lazy(async () => await import("../components/device-page/tabs/Scene.js"));
const StateTab = lazy(async () => await import("../components/device-page/tabs/State.js"));

function renderTab(sourceIdx: number, tab: TabName, device: Device) {
    const key = `${sourceIdx}-${device.ieee_address}`;

    switch (tab) {
        case "info":
            return <DeviceInfoTab key={key} sourceIdx={sourceIdx} device={device} />;
        case "exposes":
            return <ExposesTab key={key} sourceIdx={sourceIdx} device={device} />;
        case "bind":
            return <BindTab key={key} sourceIdx={sourceIdx} device={device} />;
        case "reporting":
            return <ReportingTab key={key} sourceIdx={sourceIdx} device={device} />;
        case "settings":
            return <DeviceSettingsTab key={key} sourceIdx={sourceIdx} ieeeAddress={device.ieee_address} />;
        case "settings-specific":
            return <DeviceSpecificSettingsTab key={key} sourceIdx={sourceIdx} device={device} />;
        case "state":
            return <StateTab key={key} sourceIdx={sourceIdx} friendlyName={device.friendly_name} />;
        case "clusters":
            return <ClustersTab key={key} device={device} />;
        case "groups":
            return <GroupsTab key={key} sourceIdx={sourceIdx} device={device} />;
        case "scene":
            return <SceneTab key={key} sourceIdx={sourceIdx} device={device} />;
        case "dev-console":
            return <DevConsoleTab key={key} sourceIdx={sourceIdx} device={device} />;
    }
}

const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

export default function DevicePage(): JSX.Element {
    const navigate = useNavigate();
    const { t } = useTranslation(["devicePage", "common"]);
    const { sourceIdx, deviceId, tab } = useParams<DevicePageUrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);
    const device = useAppStore(
        useShallow((state) => (deviceId ? state.devices[numSourceIdx].find((device) => device.ieee_address === deviceId) : undefined)),
    );

    useEffect(() => {
        if (sourceIdx && validSourceIdx && device) {
            if (device.type === "Coordinator") {
                navigate(`/settings/${sourceIdx}/about`, { replace: true });
            } else if (!tab) {
                navigate(`/device/${sourceIdx}/${device.ieee_address}/info`, { replace: true });
            }
        } else {
            navigate("/devices", { replace: true });
        }
    }, [sourceIdx, validSourceIdx, tab, device, navigate]);

    return (
        <>
            <NavBarContent>
                <HeaderDeviceSelector currentSourceIdx={numSourceIdx} currentDevice={device} tab={tab} />
            </NavBarContent>

            <div className="tabs tabs-border mt-2">
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/info`} className={isTabActive}>
                    <FontAwesomeIcon icon={faInfo} className="me-2" />
                    {t(($) => $.about)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/exposes`} className={isTabActive}>
                    <FontAwesomeIcon icon={faWandMagic} className="me-2" />
                    {t(($) => $.exposes)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/bind`} className={isTabActive}>
                    <FontAwesomeIcon icon={faLink} className="me-2" />
                    {t(($) => $.bind)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/reporting`} className={isTabActive}>
                    <FontAwesomeIcon icon={faDownLong} className="me-2" />
                    {t(($) => $.reporting)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/settings`} className={isTabActive}>
                    <FontAwesomeIcon icon={faCogs} className="me-2" />
                    {t(($) => $.settings)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/settings-specific`} className={isTabActive}>
                    <FontAwesomeIcon icon={faCog} className="me-2" />
                    {t(($) => $.settings_specific)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/state`} className={isTabActive}>
                    <FontAwesomeIcon icon={faArrowsSpin} className="me-2" />
                    {t(($) => $.state)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/clusters`} className={isTabActive}>
                    <FontAwesomeIcon icon={faReceipt} className="me-2" />
                    {t(($) => $.clusters)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/groups`} className={isTabActive}>
                    <FontAwesomeIcon icon={faObjectGroup} className="me-2" />
                    {t(($) => $.groups)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/scene`} className={isTabActive}>
                    <FontAwesomeIcon icon={faWandSparkles} className="me-2" />
                    {t(($) => $.scene)}
                </NavLink>
                <NavLink to={`/device/${numSourceIdx}/${deviceId}/dev-console`} className={isTabActive}>
                    <FontAwesomeIcon icon={faBug} className="me-2" />
                    {t(($) => $.dev_console)}
                </NavLink>

                <div className="tab-content block h-full bg-base-100 p-3">
                    {tab && device ? (
                        renderTab(numSourceIdx, tab, device)
                    ) : (
                        <div className="flex-auto justify-center items-center">{t(($) => $.unknown_device, { ns: "common" })}</div>
                    )}
                </div>
            </div>
        </>
    );
}
