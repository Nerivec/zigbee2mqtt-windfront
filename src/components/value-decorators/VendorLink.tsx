import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { Device } from "../../types.js";

type VendorLinkProps = {
    device: Device;
};

const VendorLink = memo(({ device }: VendorLinkProps) => {
    const { t } = useTranslation("zigbee");
    let label = t(($) => $.unsupported);
    let url = SUPPORT_NEW_DEVICES_DOCS_URL;

    if (device.supported && device.definition) {
        url = `https://www.zigbee2mqtt.io/supported-devices/#v=${encodeURIComponent(device.definition.vendor)}`;
        label = device.definition.vendor;
    }

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {label}
        </Link>
    );
});

export default VendorLink;
