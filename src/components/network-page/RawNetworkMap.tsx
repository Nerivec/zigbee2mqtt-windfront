import { type ChangeEvent, memo, useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GraphCanvas, type GraphCanvasRef, type GraphEdge, type GraphNode, type LabelVisibilityType, type LayoutTypes, useSelection } from "reagraph";
import store2 from "store2";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import {
    NETWORK_MAP_LABEL_TYPE_KEY,
    NETWORK_MAP_LAYOUT_TYPE_KEY,
    NETWORK_MAP_LINK_DISTANCE_KEY,
    NETWORK_MAP_NODE_STRENGTH_KEY,
} from "../../localStoreConsts.js";
import fontUrl from "./../../styles/NotoSans-Regular.ttf";
import { EDGE_RELATIONSHIP_FILL_COLORS, NODE_TYPE_FILL_COLORS, type NetworkMapLink, ZigbeeRelationship } from "./index.js";
import ContextMenu from "./raw-map/ContextMenu.js";
import Controls from "./raw-map/Controls.js";
import Legend from "./raw-map/Legend.js";

type RawNetworkMapProps = {
    map: Zigbee2MQTTNetworkMap;
};

const RawNetworkMap = memo(({ map }: RawNetworkMapProps) => {
    const { t } = useTranslation("network");
    const [layoutType, setLayoutType] = useState<LayoutTypes>(store2.get(NETWORK_MAP_LAYOUT_TYPE_KEY, "forceDirected2d"));
    const [labelType, setLabelType] = useState<LabelVisibilityType>(store2.get(NETWORK_MAP_LABEL_TYPE_KEY, "all"));
    const [nodeStrength, setNodeStrength] = useState<number>(store2.get(NETWORK_MAP_NODE_STRENGTH_KEY, -750));
    const [linkDistance, setLinkDistance] = useState<number>(store2.get(NETWORK_MAP_LINK_DISTANCE_KEY, 50));
    const [showParents, setShowParents] = useState(true);
    const [showChildren, setShowChildren] = useState(true);
    const [showSiblings, setShowSiblings] = useState(true);
    const graphRef = useRef<GraphCanvasRef | null>(null);

    const [nodes, edges] = useMemo(() => {
        const computedNodes: GraphNode[] = [];
        const computedEdges: GraphEdge[] = [];
        const processedLinks: [NetworkMapLink, NetworkMapLink | undefined][] = [];

        for (const node of map.nodes) {
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
                    parentFriendlyName += ` - ${t("children")}`;
                }
            }

            computedNodes.push({
                id: node.ieeeAddr,
                data: {
                    ...node,
                    parent: parentFriendlyName,
                },
                label: node.friendlyName,
                // subLabel: node.ieeeAddr,
                labelVisible: true,
                // icon: device.definition.icon
                fill: NODE_TYPE_FILL_COLORS[node.type],
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
                size:
                    link.relationship === ZigbeeRelationship.NeighborIsParent || link.relationship === ZigbeeRelationship.NeighborIsAChild
                        ? 1.5
                        : 0.75,
                labelVisible: true,
                source: link.source.ieeeAddr,
                target: link.target.ieeeAddr,
                fill: EDGE_RELATIONSHIP_FILL_COLORS[link.relationship],
            });
        }

        return [computedNodes, computedEdges];
    }, [map, showParents, showChildren, showSiblings, t]);

    const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
        ref: graphRef,
        nodes: nodes,
        edges: edges,
        type: "single",
        pathSelectionType: "out",
        /** XXX: camera reset on unselect is annoying */
        focusOnSelect: false,
    });

    const onLayoutTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value) {
            store2.set(NETWORK_MAP_LAYOUT_TYPE_KEY, event.target.value);
            setLayoutType(event.target.value as LayoutTypes);
            graphRef.current?.resetControls();
            graphRef.current?.centerGraph();
            graphRef.current?.fitNodesInView();
        }
    }, []);

    const onLabelTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value) {
            store2.set(NETWORK_MAP_LABEL_TYPE_KEY, event.target.value);
            setLabelType(event.target.value as LabelVisibilityType);
        }
    }, []);

    const onNodeStrengthChange = useCallback((value: number) => {
        store2.set(NETWORK_MAP_NODE_STRENGTH_KEY, value);
        setNodeStrength(value);
    }, []);

    const onLinkDistanceChange = useCallback((value: number) => {
        store2.set(NETWORK_MAP_LINK_DISTANCE_KEY, value);
        setLinkDistance(value);
    }, []);

    return (
        <>
            <Legend />
            <div className="relative h-screen">
                <Controls
                    graphRef={graphRef}
                    layoutType={layoutType}
                    onLayoutTypeChange={onLayoutTypeChange}
                    labelType={labelType}
                    onLabelTypeChange={onLabelTypeChange}
                    nodeStrength={nodeStrength}
                    onNodeStrengthChange={onNodeStrengthChange}
                    linkDistance={linkDistance}
                    onLinkDistanceChange={onLinkDistanceChange}
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
                    nodes={nodes}
                    edges={edges}
                    clusterAttribute={layoutType.startsWith("forceDirected") ? "parent" : undefined}
                    selections={selections}
                    actives={actives}
                    onCanvasClick={onCanvasClick}
                    onNodeClick={onNodeClick}
                    layoutType={layoutType}
                    layoutOverrides={{
                        nodeStrength,
                        linkDistance,
                    }}
                    sizingType="centrality"
                    labelType={labelType}
                    labelFontUrl={fontUrl}
                    edgeLabelPosition="natural"
                    lassoType="node"
                    cameraMode={layoutType.endsWith("3d") ? "rotate" : "pan"}
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
