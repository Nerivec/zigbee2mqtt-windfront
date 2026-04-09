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
    brackets?: boolean;
};

const VendorLink = memo(({ supported, definitionVendor, icon = false, brackets = false }: VendorLinkProps) => {
    const { t } = useTranslation("zigbee");
    let label = t(($) => $.unsupported);
    let url = SUPPORT_NEW_DEVICES_DOCS_URL;

    if (supported && definitionVendor) {
        url = `https://www.zigbee2mqtt.io/supported-devices/#v=${encodeURIComponent(definitionVendor)}`;
        label = definitionVendor;
    }

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {brackets && "("}
            {label.split(" ").slice(0, -1).join(" ")}
            <span className="whitespace-nowrap">
                {label.split(" ").slice(-1)[0]}
                {icon && <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ms-0.5" />}
                {brackets && ")"}
            </span>
        </Link>
    );
});

export default VendorLink;
