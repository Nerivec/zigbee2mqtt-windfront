import { faCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toHex } from "../../../utils.js";
import { type NetworkMapNode, NODE_TYPE_FILL_COLORS } from "../index.js";

type UnlinkedNodesProps = {
    sourceIdx: number;
    nodes: NetworkMapNode[];
};

const UnlinkedNodes = memo(({ sourceIdx, nodes }: UnlinkedNodesProps) => {
    const { t } = useTranslation(["network", "common", "zigbee"]);

    const sortedNodes = useMemo(() => nodes.toSorted((a, b) => a.friendlyName.localeCompare(b.friendlyName)), [nodes]);

    return (
        // top offset matches the height of the controls above, width matches the 2x w-36 select
        <details className="absolute z-9 top-10 right-0 m-1 w-72 max-w-[calc(100vw-0.5rem)] collapse collapse-arrow bg-base-200 shadow" open>
            <summary className="collapse-title font-semibold min-h-0 py-2">
                {t(($) => $.unlinked_devices)} <span className="badge badge-sm badge-neutral">{nodes.length}</span>
            </summary>
            <div className="collapse-content text-sm px-2">
                <ul className="menu menu-sm flex-nowrap w-full p-0 max-h-[50vh] overflow-y-auto">
                    {sortedNodes.map((node) => (
                        <li
                            key={node.ieeeAddr}
                            title={`${node.type} | ${t(($) => $.ieee_address, { ns: "zigbee" })}: ${node.ieeeAddr} | ${t(($) => $.network_address, { ns: "zigbee" })}: ${toHex(node.networkAddress, 4)} (${node.networkAddress})`}
                        >
                            <Link to={node.type === "Coordinator" ? "/settings/about" : `/device/${sourceIdx}/${node.ieeeAddr}/info`}>
                                <FontAwesomeIcon
                                    icon={faCircle}
                                    style={{ color: NODE_TYPE_FILL_COLORS[node.type as keyof typeof NODE_TYPE_FILL_COLORS] }}
                                />
                                <span className="truncate">{node.friendlyName}</span>
                                {node.failed && node.failed.length > 0 && (
                                    <span className="tooltip tooltip-left" data-tip={`${t(($) => $.failed, { ns: "common" })}: ${node.failed}`}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-error" />
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </details>
    );
});

export default UnlinkedNodes;
