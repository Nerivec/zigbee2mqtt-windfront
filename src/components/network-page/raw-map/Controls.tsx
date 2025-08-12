import {
    faArrowRightLong,
    faArrowsLeftRightToLine,
    faArrowsUpToLine,
    faDownload,
    faExpand,
    faIcons,
    faMagnet,
    faMinusSquare,
    faPlusSquare,
    faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import saveAs from "file-saver";
import { type ChangeEvent, memo, type RefObject, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { GraphCanvasRef, GraphNode, LabelVisibilityType, LayoutTypes } from "reagraph";
import Button from "../../Button.js";
import { EDGE_RELATIONSHIP_FILL_COLORS, ZigbeeRelationship } from "../index.js";
import SliderField from "./SliderField.js";

type ControlsProps = {
    graphRef: RefObject<GraphCanvasRef | null>;
    layoutType: LayoutTypes;
    onLayoutTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    labelType: LabelVisibilityType;
    onLabelTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    nodeStrength: number;
    onNodeStrengthChange: (value: number) => void;
    linkDistance: number;
    onLinkDistanceChange: (value: number) => void;
    nodes: GraphNode[];
    showParents: boolean;
    setShowParents: (value: boolean) => void;
    showChildren: boolean;
    setShowChildren: (value: boolean) => void;
    showSiblings: boolean;
    setShowSiblings: (value: boolean) => void;
    showIcons: boolean;
    setShowIcons: (value: boolean) => void;
};

const Controls = memo(
    ({
        graphRef,
        layoutType,
        onLayoutTypeChange,
        labelType,
        onLabelTypeChange,
        nodeStrength,
        onNodeStrengthChange,
        linkDistance,
        onLinkDistanceChange,
        nodes,
        showParents,
        setShowParents,
        showChildren,
        setShowChildren,
        showSiblings,
        setShowSiblings,
        showIcons,
        setShowIcons,
    }: ControlsProps) => {
        const { t } = useTranslation("network");

        const nodeOptions = useMemo(() => {
            const mapping: [string, string][] = nodes.map((node) => [
                node.id,
                node.data.type !== "Coordinator" ? `${node.data.type[0]} - ${node.label}` : node.label!,
            ]);

            mapping.sort(([, a], [, b]) => a.localeCompare(b));

            return mapping.map(([id, friendlyName]) => (
                <option key={id} value={id}>
                    {friendlyName}
                </option>
            ));
        }, [nodes]);

        const downloadAsImage = useCallback(() => {
            if (graphRef.current) {
                saveAs(graphRef.current.exportCanvas(), `network-map-${Date.now()}.png`);
            }
        }, [graphRef]);

        const findNode = useCallback(
            (event: ChangeEvent<HTMLSelectElement>) => {
                if (event.target.value) {
                    const target = [event.target.value];

                    graphRef.current?.centerGraph(target);
                    graphRef.current?.fitNodesInView(target);
                }
            },
            [graphRef],
        );

        return (
            <>
                {/** 19rem matches for 2x w-36 select currently in right side */}
                <div className="absolute z-9 top-0 left-0 p-1 flex flex-row flex-wrap gap-1 items-start max-w-[calc(100vw-19rem)] md:max-w-none">
                    <Button title={t("download_image")} className="btn btn-square btn-neutral btn-sm" onClick={downloadAsImage}>
                        <FontAwesomeIcon icon={faDownload} />
                    </Button>
                    <Button
                        title={t("reset_controls")}
                        className="btn btn-square btn-neutral btn-sm"
                        onClick={() => {
                            graphRef.current?.resetControls();
                        }}
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                    </Button>
                    <Button
                        title={t("fit_view")}
                        className="btn btn-square btn-neutral btn-sm"
                        onClick={() => {
                            graphRef.current?.centerGraph();
                            graphRef.current?.fitNodesInView();
                        }}
                    >
                        <FontAwesomeIcon icon={faExpand} />
                    </Button>
                    <Button
                        title={t("zoom_in")}
                        className="btn btn-square btn-neutral btn-sm"
                        onClick={() => {
                            graphRef.current?.zoomIn();
                        }}
                    >
                        <FontAwesomeIcon icon={faPlusSquare} />
                    </Button>
                    <Button
                        title={t("zoom_out")}
                        className="btn btn-square btn-neutral btn-sm"
                        onClick={() => {
                            graphRef.current?.zoomOut();
                        }}
                    >
                        <FontAwesomeIcon icon={faMinusSquare} />
                    </Button>
                    <Button<boolean>
                        className={`btn btn-square btn-neutral btn-sm ${showParents ? "" : "btn-outline"}`}
                        item={!showParents}
                        onClick={setShowParents}
                        title={t("parent")}
                    >
                        <FontAwesomeIcon
                            icon={faArrowRightLong}
                            style={{ color: EDGE_RELATIONSHIP_FILL_COLORS[ZigbeeRelationship.NeighborIsParent] }}
                        />
                    </Button>
                    <Button<boolean>
                        className={`btn btn-square btn-neutral btn-sm ${showChildren ? "" : "btn-outline"}`}
                        item={!showChildren}
                        onClick={setShowChildren}
                        title={t("child")}
                    >
                        <FontAwesomeIcon
                            icon={faArrowRightLong}
                            style={{ color: EDGE_RELATIONSHIP_FILL_COLORS[ZigbeeRelationship.NeighborIsAChild] }}
                        />
                    </Button>
                    <Button<boolean>
                        className={`btn btn-square btn-neutral btn-sm ${showSiblings ? "" : "btn-outline"}`}
                        item={!showSiblings}
                        onClick={setShowSiblings}
                        title={t("sibling")}
                    >
                        <FontAwesomeIcon
                            icon={faArrowRightLong}
                            style={{ color: EDGE_RELATIONSHIP_FILL_COLORS[ZigbeeRelationship.NeighborIsASibling] }}
                        />
                    </Button>
                    <Button<boolean>
                        className={`btn btn-square btn-neutral btn-sm ${showIcons ? "" : "btn-outline"}`}
                        item={!showIcons}
                        onClick={setShowIcons}
                        title={t("icons")}
                    >
                        <FontAwesomeIcon icon={faIcons} />
                    </Button>
                    <select className="select select-sm w-36" title={t("find_node")} defaultValue="" onChange={findNode}>
                        <option value="">{t("find_node")}</option>
                        {nodeOptions}
                    </select>
                </div>
                <div className="absolute z-9 top-0 right-0 p-1 flex flex-row flex-wrap gap-1 items-start justify-end">
                    <select className="select select-sm w-36" title={t("layout_type")} value={layoutType} onChange={onLayoutTypeChange}>
                        <option value="" disabled>
                            {t("layout_type")}
                        </option>
                        <option value="forceDirected2d">forceDirected2d</option>
                        <option value="forceDirected3d">forceDirected3d</option>
                        <option value="radialOut2d">radialOut2d</option>
                        <option value="radialOut3d">radialOut3d</option>
                        <option value="concentric2d">concentric2d</option>
                    </select>
                    <select className="select select-sm w-36" title={t("label_type")} value={labelType} onChange={onLabelTypeChange}>
                        <option value="" disabled>
                            {t("label_type")}
                        </option>
                        <option value="all">all</option>
                        <option value="auto">auto</option>
                        <option value="none">none</option>
                        <option value="nodes">nodes</option>
                        <option value="edges">edges</option>
                    </select>
                </div>
                <div className="absolute z-9 bottom-0 left-0 p-1 flex flex-row flex-wrap gap-1 items-end">
                    <SliderField
                        name="node_strength"
                        label={t("node_strength")}
                        icon={faMagnet}
                        onSubmit={(value, valid) => valid && typeof value === "number" && onNodeStrengthChange(value)}
                        min={-1000}
                        max={-100}
                        step={10}
                        defaultValue={nodeStrength}
                    />
                    <SliderField
                        name="link_distance"
                        label={t("link_distance")}
                        icon={faArrowsLeftRightToLine}
                        onSubmit={(value, valid) => valid && typeof value === "number" && onLinkDistanceChange(value)}
                        min={10}
                        max={200}
                        step={5}
                        defaultValue={linkDistance}
                    />
                </div>
                <div className="absolute z-9 bottom-0 right-0 p-1 flex flex-row flex-wrap gap-1 items-end justify-end">
                    <Button
                        title={t("scroll_to_top")}
                        className="btn btn-primary btn-square ml-auto"
                        onClick={() => {
                            window.scrollTo(0, 0);
                        }}
                    >
                        <FontAwesomeIcon icon={faArrowsUpToLine} />
                    </Button>
                </div>
            </>
        );
    },
);

export default Controls;
