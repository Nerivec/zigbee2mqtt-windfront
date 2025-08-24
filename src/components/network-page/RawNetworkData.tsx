import { faClose, faExclamationTriangle, faMagnifyingGlass, faMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { groupBy } from "lodash";
import { type JSX, memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useSearch } from "../../hooks/useSearch.js";
import { useAppStore } from "../../store.js";
import { toHex } from "../../utils.js";
import Button from "../Button.js";
import DeviceImage from "../device/DeviceImage.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";
import PowerSource from "../value-decorators/PowerSource.js";
import RawRelationGroup from "./raw-data/RawRelationGroup.js";

type RawNetworkMapProps = {
    sourceIdx: number;
    map: Zigbee2MQTTNetworkMap;
};

const RawNetworkData = memo(({ sourceIdx, map }: RawNetworkMapProps) => {
    const { t } = useTranslation(["network", "common"]);
    const devices = useAppStore(useShallow((state) => state.devices[sourceIdx]));
    const [searchTerm, normalizedSearchTerm, setSearchTerm] = useSearch();
    const [highlightValue, normalizedHighlightValue, setHighlightValue] = useSearch();

    const highlight = useCallback(
        (friendlyName: string) => {
            return normalizedHighlightValue.length > 0 && friendlyName.toLowerCase().includes(normalizedHighlightValue);
        },
        [normalizedHighlightValue],
    );

    const content = useMemo(() => {
        const sortedNodes: JSX.Element[] = [];

        for (const node of map.nodes) {
            const device = devices.find((device) => device.ieee_address === node.ieeeAddr);

            if (normalizedSearchTerm.length === 0 || node.friendlyName.toLowerCase().includes(normalizedSearchTerm)) {
                const grouped = groupBy(
                    map.links.filter((link) => link.target.ieeeAddr === node.ieeeAddr),
                    (link) => link.relationship,
                );
                const groupedRelations: JSX.Element[] = [];

                for (const key in grouped) {
                    const relations = grouped[key];

                    groupedRelations.push(
                        <RawRelationGroup
                            key={key}
                            sourceIdx={sourceIdx}
                            devices={devices}
                            relations={relations}
                            highlight={highlight}
                            setHighlightValue={setHighlightValue}
                            relationship={key}
                        />,
                    );
                }

                const highlighted = highlight(node.friendlyName);
                const nodeLink = node.type === "Coordinator" ? "/settings/about" : `/device/${sourceIdx}/${node.ieeeAddr}/info`;

                sortedNodes.push(
                    <ul className="w-md menu bg-base-200 rounded-box shadow" key={node.friendlyName}>
                        <li
                            title={`${t("zigbee:ieee_address")}: ${node.ieeeAddr} | ${t("zigbee:network_address")}: ${toHex(node.networkAddress, 4)} (${node.networkAddress})`}
                            className={highlighted ? "bg-accent text-accent-content rounded-sm" : undefined}
                        >
                            {/** biome-ignore lint/a11y/noStaticElementInteractions: special case */}
                            <span onClick={() => (highlighted ? setHighlightValue("") : setHighlightValue(node.friendlyName))}>
                                <span className="w-10 h-10">
                                    <DeviceImage disabled={false} device={device} noIndicator={true} />
                                </span>
                                {node.friendlyName}
                                {device && node.type !== "Coordinator" && (
                                    <span className="badge badge-ghost">
                                        <PowerSource device={device} showLevel={false} />
                                    </span>
                                )}
                                {node.failed && node.failed.length > 0 && (
                                    <span className="badge badge-ghost" title={`${t("common:failed")}: ${node.failed}`}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-error" beatFade />
                                    </span>
                                )}
                            </span>
                        </li>
                        <li>
                            <span className="cursor-default">{node.type}</span>
                        </li>
                        <li>
                            <Link to={nodeLink} className="link link-hover">
                                <span title={t("zigbee:ieee_address")}>{node.ieeeAddr}</span>
                                <span title={t("zigbee:network_address_hex")} className="justify-self-end">
                                    {toHex(node.networkAddress, 4)} | <span title={t("zigbee:network_address_dec")}>{node.networkAddress}</span>
                                </span>
                            </Link>
                        </li>
                        {groupedRelations}
                    </ul>,
                );
            }
        }

        sortedNodes.sort((a, b) => (a.key === "Coordinator" ? -1 : a.key!.localeCompare(b.key!)));

        return sortedNodes;
    }, [sourceIdx, devices, normalizedSearchTerm, map, highlight, setHighlightValue, t]);

    return (
        <>
            <div className="flex flex-row justify-center items-center gap-3">
                <div className="join">
                    <label className="input w-64 join-item">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <DebouncedInput
                            onChange={setSearchTerm}
                            placeholder={t("common:search")}
                            value={searchTerm}
                            disabled={map.nodes.length === 0}
                        />
                    </label>
                    <Button
                        item=""
                        onClick={setSearchTerm}
                        className="btn btn-square btn-warning btn-outline join-item"
                        title={t("common:clear")}
                        disabled={searchTerm.length === 0}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
                <div className="join">
                    <label className="input w-64 join-item">
                        <FontAwesomeIcon icon={faMarker} />
                        <DebouncedInput
                            onChange={setHighlightValue}
                            placeholder={t("common:highlight")}
                            value={highlightValue}
                            disabled={map.nodes.length === 0}
                            title={t("highlight_info")}
                        />
                    </label>
                    <Button
                        item=""
                        onClick={setHighlightValue}
                        className="btn btn-square btn-warning btn-outline join-item"
                        title={t("common:clear")}
                        disabled={highlightValue === ""}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
            </div>
            <div className="flex flex-row flex-wrap justify-center gap-3 p-3">{content}</div>
        </>
    );
});

export default RawNetworkData;
