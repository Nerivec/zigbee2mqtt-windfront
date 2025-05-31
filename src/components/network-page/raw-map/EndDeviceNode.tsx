import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Handle, type Node, type NodeProps, NodeToolbar, Position } from "@xyflow/react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Device } from "../../../types.js";
import { toHex } from "../../../utils.js";
import DeviceImage from "../../device/DeviceImage.js";
import type { RawMapNode } from "../index.js";

const EndDeviceNode = memo(({ data, selected }: NodeProps<Node<RawMapNode>>) => {
    const { t } = useTranslation(["network"]);

    return (
        <>
            <div className={`w-16 h-16 p-1${selected ? " animate-pulse" : ""}`}>
                <DeviceImage
                    disabled={false}
                    device={{ ieee_address: data.ieeeAddr, supported: !!data.definition, definition: data.definition } as unknown as Device}
                />
            </div>
            <NodeToolbar position={Position.Bottom}>
                <div className="card bg-accent text-accent-content shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title">
                            <Link to={`/device/${data.friendlyName}/about`} className="link link-hover">
                                {data.friendlyName}
                            </Link>
                        </h2>
                        <span>{data.type}</span>
                        <span title={t("zigbee:ieee_address")}>{data.ieeeAddr}</span>
                        <span title={t("zigbee:network_address_hex")} className="justify-self-end">
                            {toHex(data.networkAddress, 4)} | <span title={t("zigbee:network_address_dec")}>{data.networkAddress}</span>
                        </span>
                        {data.failed && data.failed.length > 0 && (
                            <div className="badge badge-ghost">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-error" beatFade />
                                {t("common:failed")}: {data.failed}
                            </div>
                        )}
                    </div>
                </div>
            </NodeToolbar>
            <Handle type="target" position={Position.Top} className="w-16 !bg-accent opacity-60" />
            <Handle type="source" position={Position.Bottom} className="w-16 !bg-accent" />
        </>
    );
});

export default EndDeviceNode;
