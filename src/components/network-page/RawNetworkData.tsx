import { faClose, faExclamationTriangle, faMagnifyingGlass, faMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { groupBy } from "lodash";
import { type JSX, memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
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
    const [filterValue, setFilterValue] = useState<string>("");
    const [highlightValue, setHighlightValue] = useState<string>("");

    const highlight = useCallback(
        (friendlyName: string) => {
            return !!highlightValue && friendlyName.toLowerCase().includes(highlightValue.toLowerCase());
        },
        [highlightValue],
    );

    const content = useMemo(() => {
        const sortedNodes: JSX.Element[] = [];

        for (const node of map.nodes) {
            const device = devices.find((device) => device.ieee_address === node.ieeeAddr);

            if (!filterValue || node.friendlyName.toLowerCase().includes(filterValue.toLowerCase())) {
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
    }, [sourceIdx, devices, filterValue, map, highlight, t]);

    return (
        <>
            <div className="flex flex-row justify-center items-center gap-3">
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
                            disabled={map.nodes.length === 0}
                        />
                    </label>
                    <Button
                        item=""
                        onClick={setFilterValue}
                        className="btn btn-square join-item"
                        title={t("common:clear")}
                        disabled={filterValue === ""}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
                <div className="join">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                    <label className="input w-64 join-item">
                        <FontAwesomeIcon icon={faMarker} />
                        <DebouncedInput
                            className=""
                            type="search"
                            onChange={(value) => setHighlightValue(value.toString())}
                            placeholder={t("common:highlight")}
                            value={highlightValue}
                            disabled={map.nodes.length === 0}
                            title={t("highlight_info")}
                        />
                    </label>
                    <Button
                        item=""
                        onClick={setHighlightValue}
                        className="btn btn-square join-item"
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
