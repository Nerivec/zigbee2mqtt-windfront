import { faArrowRightLong, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { EDGE_RELATIONSHIP_FILL_COLORS, NODE_TYPE_FILL_COLORS, ZigbeeRelationship } from "..";

const Legend = memo(() => {
    const { t } = useTranslation("network");

    return (
        <details className="collapse collapse-arrow rounded-b-none">
            <summary className="collapse-title font-semibold">{t("legend")}</summary>
            <div className="collapse-content text-sm">
                <div className="flex flex-row flex-wrap gap-3 mb-2">
                    <div>
                        <p>{t("nodes")}:</p>
                        <ul className="list-none list-inside">
                            <li style={{ color: NODE_TYPE_FILL_COLORS.Coordinator }}>
                                <FontAwesomeIcon icon={faCircle} /> Coordinator
                            </li>
                            <li style={{ color: NODE_TYPE_FILL_COLORS.Router }}>
                                <FontAwesomeIcon icon={faCircle} /> Router
                            </li>
                            <li style={{ color: NODE_TYPE_FILL_COLORS.EndDevice }}>
                                <FontAwesomeIcon icon={faCircle} /> EndDevice
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p>{t("edges")}:</p>
                        <ul className="list-none list-inside">
                            <li style={{ color: EDGE_RELATIONSHIP_FILL_COLORS[ZigbeeRelationship.NeighborIsParent] }}>
                                <FontAwesomeIcon icon={faArrowRightLong} /> {t("parent")}
                            </li>
                            <li style={{ color: EDGE_RELATIONSHIP_FILL_COLORS[ZigbeeRelationship.NeighborIsAChild] }}>
                                <FontAwesomeIcon icon={faArrowRightLong} /> {t("child")}
                            </li>
                            <li style={{ color: EDGE_RELATIONSHIP_FILL_COLORS[ZigbeeRelationship.NeighborIsASibling] }}>
                                <FontAwesomeIcon icon={faArrowRightLong} /> {t("sibling")}
                            </li>
                        </ul>
                    </div>
                </div>
                <p>{t("legend_node_siblings")}</p>
                <p>{t("legend_node_size")}</p>
                <p>{t("legend_node_select")}</p>
                <p>{t("legend_node_fold")}</p>
                <p>{t("legend_edge_toggle")}</p>
                {/* XXX: temporary */}
                <p className="text-xs mt-2">Known issues:</p>
                <ul className="list-disc list-inside text-xs">
                    <li>Edge colors are currently not working</li>
                    <li>An undesired vertical offset is applied when starting to drag a node</li>
                </ul>
            </div>
        </details>
    );
});

export default Legend;
