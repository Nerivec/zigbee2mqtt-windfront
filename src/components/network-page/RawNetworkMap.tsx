import "@xyflow/react/dist/base.css";
import dagre from "@dagrejs/dagre";
import {
    Background,
    BackgroundVariant,
    ConnectionLineType,
    type Edge,
    type Node,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import { memo, useCallback, useMemo } from "react";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import { type DagreDirection, type RawMapEdge, type RawMapNode, ZigbeeRelationship } from "./index.js";
import ChildEdge from "./raw-map/ChildEdge.js";
import Controls from "./raw-map/Controls.js";
import CoordinatorNode from "./raw-map/CoordinatorNode.js";
import EndDeviceNode from "./raw-map/EndDeviceNode.js";
import ParentEdge from "./raw-map/ParentEdge.js";
import RouterNode from "./raw-map/RouterNode.js";
import SiblingEdge from "./raw-map/SiblingEdge.js";

type RawNetworkMapProps = {
    map: Zigbee2MQTTNetworkMap;
};

const DEFAULT_EDGE_TYPES = {
    [ZigbeeRelationship.NeighborIsParent]: ParentEdge,
    [ZigbeeRelationship.NeighborIsAChild]: ChildEdge,
    [ZigbeeRelationship.NeighborIsASibling]: SiblingEdge,
    // [ZigbeeRelationship.NoneOfTheAbove]: ,
};
const DEFAULT_NODE_TYPES = {
    Coordinator: CoordinatorNode,
    Router: RouterNode,
    EndDevice: EndDeviceNode,
};
const DEFAULT_NODE_WIDTH = 64;
const DEFAULT_NODE_HEIGHT = 64;

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const buildGraph = (nodes: RawMapNode[], edges: RawMapEdge[], direction: DagreDirection = "TB"): [Node<RawMapNode>[], Edge<RawMapEdge>[]] => {
    const isHorizontal = direction === "LR";

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 128,
        edgesep: 64,
        ranksep: 128,
        // network-simplex, tight-tree or longest-path
        ranker: "network-simplex",
    });

    for (const node of nodes) {
        dagreGraph.setNode(node.ieeeAddr, {
            width: DEFAULT_NODE_WIDTH,
            height: DEFAULT_NODE_HEIGHT,
        });
    }

    const processedEdges: Edge<RawMapEdge>[] = [];

    for (const edge of edges) {
        if (edge.relationship > 2) {
            continue;
        }

        dagreGraph.setEdge(edge.source.ieeeAddr, edge.target.ieeeAddr);
        processedEdges.push({
            id: `${edge.source.ieeeAddr}-${edge.target.ieeeAddr}-${edge.relationship}`,
            source: edge.source.ieeeAddr,
            target: edge.target.ieeeAddr,
            type: `${edge.relationship}`,
            animated: false,
            data: edge,
        });
    }

    dagre.layout(dagreGraph);

    return [
        nodes.map((node): Node<RawMapNode> => {
            const nodeWithPosition = dagreGraph.node(node.ieeeAddr);

            return {
                id: node.ieeeAddr,
                type: node.type,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                // We are shifting the dagre node position (anchor=center center) to the top left so it matches the React Flow node anchor point (top left).
                position: {
                    x: nodeWithPosition.x - DEFAULT_NODE_WIDTH / 2,
                    y: nodeWithPosition.y - DEFAULT_NODE_HEIGHT / 2,
                },
                data: node,
            };
        }),
        processedEdges,
    ];
};

const RawNetworkMap = memo(({ map }: RawNetworkMapProps) => {
    const [processedNodes, processedEdges] = useMemo(() => buildGraph(map.nodes, map.links), [map]);
    const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);

    const onLayout = useCallback(
        (direction: DagreDirection) => {
            const [processedNodes, processedEdges] = buildGraph(map.nodes, map.links, direction);

            setNodes(processedNodes);
            setEdges(processedEdges);
        },
        [map, setNodes, setEdges],
    );

    return (
        <div className="h-screen px-6">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={DEFAULT_NODE_TYPES}
                edgeTypes={DEFAULT_EDGE_TYPES}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                elementsSelectable
                selectNodesOnDrag={false}
                elevateNodesOnSelect
                elevateEdgesOnSelect
                nodesDraggable
                nodesFocusable
                nodesConnectable={false}
                edgesFocusable
                edgesReconnectable={false}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                minZoom={0.1}
                maxZoom={3}
                className="!bg-base-100"
            >
                <Controls onLayout={onLayout} />
                <Background variant={BackgroundVariant.Dots} className="text-base-content" />
            </ReactFlow>
        </div>
    );
});

export default RawNetworkMap;
