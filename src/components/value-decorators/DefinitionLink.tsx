import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { Device } from "../../types.js";
import { normalizeDefinitionModel } from "../../utils.js";
import ExternalIcon from "./ExternalIcon.js";

type DefinitionLinkProps = {
    modelId: Device["model_id"];
    supported: Device["supported"];
    definitionModel?: NonNullable<Device["definition"]>["model"];
    icon?: boolean;
};

const DefinitionLink = memo(({ modelId, supported, definitionModel, icon = false }: DefinitionLinkProps) => {
    const { t } = useTranslation("zigbee");
    let label = modelId || t(($) => $.unknown);
    let url = SUPPORT_NEW_DEVICES_DOCS_URL;

    if (supported && definitionModel) {
        url = `https://www.zigbee2mqtt.io/devices/${encodeURIComponent(normalizeDefinitionModel(definitionModel))}.html`;
        label = definitionModel;
    }

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {label}
            {icon ? <ExternalIcon /> : null}
        </Link>
    );
});

export default DefinitionLink;
