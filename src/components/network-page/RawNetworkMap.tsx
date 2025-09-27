import merge from "lodash/merge.js";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    GraphCanvas,
    type GraphCanvasRef,
    type GraphEdge,
    type GraphNode,
    type LabelVisibilityType,
    type LayoutTypes,
    lightTheme,
    type Theme,
    useSelection,
} from "reagraph";
import store2 from "store2";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import genericDevice from "../../images/generic-zigbee-device.png";
import { NETWORK_MAP_CONFIG_KEY } from "../../localStoreConsts.js";
import { useAppStore } from "../../store.js";
import fontUrl from "./../../styles/NotoSans-Regular.ttf";
import { getZ2MDeviceImage } from "../device/index.js";
import { cssColorToRgba, EDGE_RELATIONSHIP_FILL_COLORS, type NetworkMapLink, NODE_TYPE_FILL_COLORS, ZigbeeRelationship } from "./index.js";
import ContextMenu from "./raw-map/ContextMenu.js";
import Controls from "./raw-map/Controls.js";
import Legend from "./raw-map/Legend.js";

export type NetworkMapConfig = {
    layoutType: LayoutTypes;
    labelType: LabelVisibilityType;
    nodeStrength: number;
    linkDistance: number;
    showIcons: boolean;
};

type RawNetworkMapProps = {
    sourceIdx: number;
    map: Zigbee2MQTTNetworkMap;
};

const RawNetworkMap = memo(({ sourceIdx, map }: RawNetworkMapProps) => {
    const { t } = useTranslation("network");
    const devices = useAppStore(useShallow((state) => state.devices[sourceIdx]));
    const [config, setConfig] = useState<NetworkMapConfig>(
        store2.get(NETWORK_MAP_CONFIG_KEY, {
            layoutType: "forceDirected2d",
            labelType: "all",
            nodeStrength: -750,
            linkDistance: 50,
            showIcons: false,
        } satisfies NetworkMapConfig),
    );
    const [showParents, setShowParents] = useState(true);
    const [showChildren, setShowChildren] = useState(true);
    const [showSiblings, setShowSiblings] = useState(true);
    const graphRef = useRef<GraphCanvasRef | null>(null);

    useEffect(() => {
        store2.set(NETWORK_MAP_CONFIG_KEY, config);
    }, [config]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.resetControls();
            graphRef.current.centerGraph();
            graphRef.current.fitNodesInView();
        }
    }, [config.layoutType]);

    const theme: Theme = useMemo(() => {
        // re-used for perf
        const ctx = new OffscreenCanvas(1, 1).getContext("2d")!;
        const style = getComputedStyle(document.documentElement);
        const colorBase100 = cssColorToRgba(ctx, style.getPropertyValue("--color-base-100"));
        const colorBase200 = cssColorToRgba(ctx, style.getPropertyValue("--color-base-200"));
        const colorBaseContent = cssColorToRgba(ctx, style.getPropertyValue("--color-base-content"));
        const colorPrimary = cssColorToRgba(ctx, style.getPropertyValue("--color-primary"));
        const colorAccent = cssColorToRgba(ctx, style.getPropertyValue("--color-accent"));

        return merge({}, lightTheme, {
            canvas: { background: colorBase100 },
            node: {
                activeFill: colorAccent,
                label: { color: colorBaseContent, stroke: colorBase200, activeColor: colorAccent },
                subLabel: { color: colorBaseContent, stroke: "transparent", activeColor: colorAccent },
            },
            lasso: { border: `1px solid ${colorPrimary}`, background: "rgba(75, 160, 255, 0.1)" },
            ring: { fill: colorBaseContent, activeFill: colorAccent },
            edge: {
                fill: colorBaseContent,
                activeFill: colorAccent,
                label: {
                    stroke: colorBase200,
                    color: colorBaseContent,
                    activeColor: colorAccent,
                },
                subLabel: {
                    color: colorBaseContent,
                    stroke: "transparent",
                    activeColor: colorAccent,
                },
            },
            arrow: { fill: colorBaseContent, activeFill: colorAccent },
            cluster: {
                stroke: colorBaseContent,
                label: { stroke: colorBase200, color: colorBaseContent },
            },
        });
    }, []);

    const [nodes, edges] = useMemo(() => {
        const computedNodes: GraphNode[] = [];
        const computedEdges: GraphEdge[] = [];
        const processedLinks: [NetworkMapLink, NetworkMapLink | undefined][] = [];

        for (const node of map.nodes) {
            const device = devices.find((device) => device.ieee_address === node.ieeeAddr);
            // determine the parent friendly name for clustering from either the target (parent is source) or the source (parent is target)
            const parent = map.links.find(
                (link) => link.relationship === ZigbeeRelationship.NeighborIsParent && link.target.ieeeAddr === node.ieeeAddr,
            );
            let parentFriendlyName = parent ? map.nodes.find((n) => n.ieeeAddr === parent!.source.ieeeAddr)?.friendlyName : undefined;

            if (!parent) {
                const child = map.links.find(
                    (link) => link.relationship === ZigbeeRelationship.NeighborIsAChild && link.source.ieeeAddr === node.ieeeAddr,
                );
                parentFriendlyName = child ? map.nodes.find((n) => n.ieeeAddr === child!.target.ieeeAddr)?.friendlyName : undefined;

                if (parentFriendlyName) {
                    parentFriendlyName += ` - ${t(($) => $.children)}`;
                }
            }

            let icon: string | undefined;

            if (config.showIcons && device) {
                icon = device.definition?.icon ?? getZ2MDeviceImage(device);

                if (icon === genericDevice) {
                    icon = undefined;
                }
            }

            computedNodes.push({
                id: node.ieeeAddr,
                data: {
                    ...node,
                    parent: parentFriendlyName,
                },
                label: node.friendlyName,
                labelVisible: true,
                fill: NODE_TYPE_FILL_COLORS[node.type],
                icon,
            });
        }

        const bestSiblings = new Map<string, NetworkMapLink>();

        for (const link of map.links) {
            if (
                (!showParents && link.relationship === ZigbeeRelationship.NeighborIsParent) ||
                (!showChildren && link.relationship === ZigbeeRelationship.NeighborIsAChild) ||
                (!showSiblings && link.relationship === ZigbeeRelationship.NeighborIsASibling)
            ) {
                continue;
            }

            if (link.relationship === ZigbeeRelationship.NeighborIsASibling) {
                const bestSibling = bestSiblings.get(link.source.ieeeAddr);

                // pick lowest depth, or highest LQI, de-dupe LQI by lowest depth
                // not "perfect", but should represent the network mostly accurately, without crowding with pointless sibling links
                if (
                    !bestSibling ||
                    // XXX: add exception when depth===255 (non-value)?
                    link.depth < bestSibling.depth ||
                    link.linkquality > bestSibling.linkquality ||
                    (bestSibling.linkquality === link.linkquality && link.depth < bestSibling.depth)
                ) {
                    bestSiblings.set(link.source.ieeeAddr, link);
                }

                continue;
            }

            const oppositeLink = map.links.find(
                (oLink) => oLink.source.ieeeAddr === link.target.ieeeAddr && oLink.target.ieeeAddr === link.source.ieeeAddr,
            );

            // only add Parent when Parent+Child present
            if (!(link.relationship === ZigbeeRelationship.NeighborIsAChild && oppositeLink?.relationship === ZigbeeRelationship.NeighborIsParent)) {
                processedLinks.push([link, oppositeLink]);
            }
        }

        for (const [, bestSibling] of bestSiblings) {
            const oppositeLink = map.links.find(
                (oLink) => oLink.source.ieeeAddr === bestSibling.target.ieeeAddr && oLink.target.ieeeAddr === bestSibling.source.ieeeAddr,
            );

            processedLinks.push([bestSibling, oppositeLink]);
        }

        const ignoreLinks: NetworkMapLink[] = [];

        for (const [link, oppositeLink] of processedLinks) {
            if (ignoreLinks.includes(link)) {
                continue;
            }

            if (link.relationship === ZigbeeRelationship.NeighborIsASibling) {
                if (
                    oppositeLink?.relationship === ZigbeeRelationship.NeighborIsParent ||
                    oppositeLink?.relationship === ZigbeeRelationship.NeighborIsAChild
                ) {
                    // skip Sibling link when Parent/Child link also present
                    continue;
                }
            }

            computedEdges.push({
                id: `${link.source.ieeeAddr}-${link.target.ieeeAddr}-${link.relationship}`,
                data: link,
                label: oppositeLink ? `${link.linkquality} / ${oppositeLink.linkquality ?? "?"}` : `${link.linkquality}`,
                size: link.relationship === ZigbeeRelationship.NoneOfTheAbove ? 0.5 : 1,
                labelVisible: true,
                source: link.source.ieeeAddr,
                target: link.target.ieeeAddr,
                fill: EDGE_RELATIONSHIP_FILL_COLORS[link.relationship],
            });
        }

        return [computedNodes, computedEdges];
    }, [map, showParents, showChildren, showSiblings, t, devices, config.showIcons]);

    const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
        ref: graphRef,
        nodes: nodes,
        edges: edges,
        type: "single",
        pathSelectionType: "out",
        /** XXX: camera reset on unselect is annoying */
        focusOnSelect: false,
    });

    return (
        <>
            <Legend />
            <div className="relative h-screen">
                <Controls
                    graphRef={graphRef}
                    config={config}
                    setConfig={setConfig}
                    nodes={nodes}
                    showParents={showParents}
                    setShowParents={setShowParents}
                    showChildren={showChildren}
                    setShowChildren={setShowChildren}
                    showSiblings={showSiblings}
                    setShowSiblings={setShowSiblings}
                />
                <GraphCanvas
                    ref={graphRef}
                    theme={theme}
                    nodes={nodes}
                    edges={edges}
                    clusterAttribute={config.layoutType.startsWith("forceDirected") ? "parent" : undefined}
                    selections={selections}
                    actives={actives}
                    onCanvasClick={onCanvasClick}
                    onNodeClick={onNodeClick}
                    layoutType={config.layoutType}
                    layoutOverrides={{
                        nodeStrength: config.nodeStrength,
                        linkDistance: config.linkDistance,
                    }}
                    sizingType="centrality"
                    labelType={config.labelType}
                    labelFontUrl={fontUrl}
                    edgeLabelPosition="natural"
                    lassoType="node"
                    cameraMode={config.layoutType.endsWith("3d") ? "rotate" : "pan"}
                    draggable
                    animated={false}
                    contextMenu={({ data: { data }, onCollapse, isCollapsed, canCollapse, onClose }) =>
                        data.friendlyName ? (
                            <ContextMenu data={data} onCollapse={onCollapse} isCollapsed={isCollapsed} canCollapse={canCollapse} onClose={onClose} />
                        ) : null
                    }
                />
            </div>
        </>
    );
});

export default RawNetworkMap;
