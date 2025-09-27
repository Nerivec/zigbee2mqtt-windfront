import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { Device } from "../../types.js";

type ModelLinkProps = {
    device: Device;
};

const normalizeModel = (model: string): string => {
    const find = "[/| |:]";
    const re = new RegExp(find, "g");

    return model.replace(re, "_");
};

const ModelLink = memo(({ device }: ModelLinkProps) => {
    const { t } = useTranslation("zigbee");
    let label = device.model_id || t(($) => $.unknown);
    let url = SUPPORT_NEW_DEVICES_DOCS_URL;

    if (device.supported && device.definition) {
        const detailsAnchor = [
            encodeURIComponent(device.definition.vendor.toLowerCase()),
            encodeURIComponent(device.definition.model.toLowerCase()),
        ].join("-");
        url = `https://www.zigbee2mqtt.io/devices/${encodeURIComponent(
            normalizeModel(device.definition.model),
        )}.html#${encodeURIComponent(normalizeModel(detailsAnchor))}`;
        label = device.definition.model;
    }

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {label}
        </Link>
    );
});

export default ModelLink;
