import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { Device } from "../../types.js";

type VendorLinkProps = {
    supported: Device["supported"];
    definitionVendor?: NonNullable<Device["definition"]>["vendor"];
    icon?: boolean;
};

const VendorLink = memo(({ supported, definitionVendor, icon = false }: VendorLinkProps) => {
    const { t } = useTranslation("zigbee");
    const label = definitionVendor || t(($) => $.unknown);
    const url =
        supported && definitionVendor
            ? `https://www.zigbee2mqtt.io/supported-devices/#v=${encodeURIComponent(definitionVendor)}`
            : SUPPORT_NEW_DEVICES_DOCS_URL;

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {label}
            {icon ? <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-0.5" /> : null}
        </Link>
    );
});

export default VendorLink;
