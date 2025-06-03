import { faExclamationTriangle, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Handle, type Node, type NodeProps, NodeToolbar, Position } from "@xyflow/react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toHex } from "../../../utils.js";
import type { RawMapNode } from "../index.js";

const CoordinatorNode = memo(({ data }: NodeProps<Node<RawMapNode>>) => {
    const { t } = useTranslation(["network"]);

    return (
        <>
            <div className="w-16 h-16 p-1">
                <FontAwesomeIcon icon={faStar} size="3x" className="text-warning" />
            </div>
            <NodeToolbar position={Position.Bottom} isVisible>
                <Link to="/settings/about" className="link link-hover">
                    {data.friendlyName}
                </Link>
            </NodeToolbar>
            <NodeToolbar position={Position.Bottom}>
                <div className="card bg-primary text-primary-content shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title">
                            <Link to="/settings/about" className="link link-hover">
                                {data.friendlyName}
                            </Link>
                        </h2>
                        <div>{data.type}</div>
                        <div title={t("zigbee:ieee_address")}>{data.ieeeAddr}</div>
                        <div title={t("zigbee:network_address_hex")} className="justify-self-end">
                            {toHex(data.networkAddress, 4)}
                        </div>
                        {data.failed && data.failed.length > 0 && (
                            <div className="badge badge-ghost">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-error" beatFade />
                                {t("common:failed")}: {data.failed}
                            </div>
                        )}
                    </div>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} className="w-16 !bg-primary opacity-60" />
            <Handle type="source" position={Position.Bottom} className="w-16 !bg-primary" />
        </>
    );
});

export default CoordinatorNode;
