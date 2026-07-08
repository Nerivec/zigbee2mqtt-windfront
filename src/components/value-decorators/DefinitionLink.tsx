import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { Device } from "../../types.js";
import { normalizeDefinitionModel } from "../../utils.js";

type DefinitionLinkProps = {
    supported: Device["supported"];
    definitionModel?: NonNullable<Device["definition"]>["model"];
    icon?: boolean;
};

const DefinitionLink = memo(({ supported, definitionModel, icon = false }: DefinitionLinkProps) => {
    const { t } = useTranslation("zigbee");
    const label = definitionModel || t(($) => $.unknown);
    const url =
        supported && definitionModel
            ? `https://www.zigbee2mqtt.io/devices/${encodeURIComponent(normalizeDefinitionModel(definitionModel))}.html`
            : SUPPORT_NEW_DEVICES_DOCS_URL;

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {label}
            {icon ? <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-0.5" /> : null}
        </Link>
    );
});

export default DefinitionLink;
