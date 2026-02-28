import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { Device } from "../../types.js";

type VendorLinkProps = {
    supported: Device["supported"];
    definitionVendor?: NonNullable<Device["definition"]>["vendor"];
};

const VendorLink = memo(({ supported, definitionVendor }: VendorLinkProps) => {
    const { t } = useTranslation("zigbee");
    let label = t(($) => $.unsupported);
    let url = SUPPORT_NEW_DEVICES_DOCS_URL;

    if (supported && definitionVendor) {
        url = `https://www.zigbee2mqtt.io/supported-devices/#v=${encodeURIComponent(definitionVendor)}`;
        label = definitionVendor;
    }

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {label}
        </Link>
    );
});

export default VendorLink;
