import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { Device } from "../../types.js";

type ModelLinkProps = {
    modelId: Device["model_id"];
    supported: Device["supported"];
    definitionModel?: NonNullable<Device["definition"]>["model"];
    definitionVendor?: NonNullable<Device["definition"]>["vendor"];
};

const normalizeModel = (model: string): string => {
    const find = "[/| |:]";
    const re = new RegExp(find, "g");

    return model.replace(re, "_");
};

const ModelLink = memo(({ modelId, supported, definitionModel, definitionVendor }: ModelLinkProps) => {
    const { t } = useTranslation("zigbee");
    let label = modelId || t(($) => $.unknown);
    let url = SUPPORT_NEW_DEVICES_DOCS_URL;

    if (supported && definitionModel && definitionVendor) {
        const detailsAnchor = [encodeURIComponent(definitionVendor.toLowerCase()), encodeURIComponent(definitionModel.toLowerCase())].join("-");
        url = `https://www.zigbee2mqtt.io/devices/${encodeURIComponent(
            normalizeModel(definitionModel),
        )}.html#${encodeURIComponent(normalizeModel(detailsAnchor))}`;
        label = definitionModel;
    }

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {label}
        </Link>
    );
});

export default ModelLink;
