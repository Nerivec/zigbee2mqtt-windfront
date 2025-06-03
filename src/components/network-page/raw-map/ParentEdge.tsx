import { BaseEdge, type Edge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "@xyflow/react";
import { memo } from "react";
import type { RawMapEdge } from "../index.js";
import EdgeLabel from "./EdgeLabel.js";

const EdgeMidLabel = memo(
    ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps<Edge<RawMapEdge>>) => {
        const [edgePath, labelX, labelY] = getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
        });

        return (
            <>
                <BaseEdge id={id} path={edgePath} className={`!stroke-warning ${selected ? "" : "opacity-50"}`} />
                {data && (
                    <EdgeLabelRenderer>
                        <EdgeLabel
                            className="text-warning"
                            transform={`translate(-150%, -50%) translate(${labelX}px,${labelY}px)`}
                            label={`${data.linkquality}`}
                            selected={selected}
                        />
                    </EdgeLabelRenderer>
                )}
            </>
        );
    },
);

export default EdgeMidLabel;
