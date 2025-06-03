import { BaseEdge, type Edge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "@xyflow/react";
import { memo } from "react";
import type { RawMapEdge } from "../index.js";
import EdgeLabel from "./EdgeLabel.js";

const SiblingEdge = memo(
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
                <BaseEdge id={id} path={edgePath} className={`!stroke-success ${selected ? "" : "opacity-50"}`} />
                {data && (
                    <EdgeLabelRenderer>
                        <EdgeLabel
                            className="text-success"
                            transform={`translate(50%, -50%) translate(${labelX}px,${labelY}px)`}
                            label={`${data.linkquality}`}
                            selected={selected}
                        />
                    </EdgeLabelRenderer>
                )}
            </>
        );
    },
);

export default SiblingEdge;
