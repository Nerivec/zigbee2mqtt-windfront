import { faClose, faExclamationTriangle, faMaximize, faMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { toHex } from "../../../utils.js";
import Button from "../../Button.js";
import type { NetworkMapNode } from "../index.js";

type ContextMenuProps = {
    data: NetworkMapNode & { parent?: string };
    onCollapse: () => void;
    isCollapsed: boolean;
    canCollapse: boolean;
    onClose: () => void;
};

const ContextMenu = memo(({ data, onCollapse, isCollapsed, canCollapse, onClose }: ContextMenuProps) => {
    const { t } = useTranslation(["network", "zigbee", "common"]);
    let parent: string | undefined;

    if (data.parent) {
        const i = data.parent.lastIndexOf(` - ${t(($) => $.children)}`);

        parent = i > -1 ? data.parent.slice(0, i) : data.parent;
    }

    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <h2 className="card-title">{data.friendlyName}</h2>
                <span>{data.type}</span>
                <span title={t(($) => $.ieee_address, { ns: "zigbee" })}>{data.ieeeAddr}</span>
                <span title={t(($) => $.network_address_hex, { ns: "zigbee" })} className="justify-self-end">
                    {toHex(data.networkAddress, 4)} | <span title={t(($) => $.network_address_dec, { ns: "zigbee" })}>{data.networkAddress}</span>
                </span>
                {parent && (
                    <span>
                        {t(($) => $.parent)}: {parent}
                    </span>
                )}
                {data.failed && data.failed.length > 0 && (
                    <div className="badge badge-ghost">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-error" beatFade />
                        {t(($) => $.failed, { ns: "common" })}: {data.failed}
                    </div>
                )}
                <div className="card-actions justify-end mt-2">
                    {canCollapse && (
                        <Button className="btn btn-square btn-primary" onClick={onCollapse}>
                            <FontAwesomeIcon icon={isCollapsed ? faMaximize : faMinimize} />
                        </Button>
                    )}
                    <Button className="btn btn-square btn-neutral" onClick={onClose}>
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default ContextMenu;
