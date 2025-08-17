import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type DetailedHTMLProps, type LiHTMLAttributes, memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Device } from "../../../types.js";
import { toHex } from "../../../utils.js";
import DeviceImage from "../../device/DeviceImage.js";
import Lqi from "../../value-decorators/Lqi.js";
import type { NetworkMapLink } from "../index.js";

type RawRelationProps = DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> & {
    sourceIdx: number;
    relation: NetworkMapLink;
    device: Device;
    highlight: (friendlyName: string) => boolean;
    setHighlightValue: (friendlyName: string) => void;
};

const RawRelation = memo(({ sourceIdx, relation, device, highlight, setHighlightValue, ...rest }: RawRelationProps) => {
    const { t } = useTranslation(["network", "common"]);

    const highlighted = useMemo(() => highlight(device.friendly_name), [device.friendly_name, highlight]);

    const onImageClick = useCallback(
        () => (highlighted ? setHighlightValue("") : setHighlightValue(device.friendly_name)),
        [device.friendly_name, highlighted, setHighlightValue],
    );

    return (
        <li
            key={relation.source.ieeeAddr}
            title={`${t("zigbee:ieee_address")}: ${device.ieee_address} | ${t("zigbee:network_address")}: ${toHex(device.network_address, 4)} (${device.network_address})`}
            className={highlighted ? "bg-accent text-accent-content rounded-sm" : undefined}
            {...rest}
        >
            <details>
                <summary className="flex flex-row">
                    {/** biome-ignore lint/a11y/noStaticElementInteractions: special case */}
                    <div className="w-8 h-8" onClick={onImageClick}>
                        <DeviceImage disabled={false} device={device} noIndicator={true} />
                    </div>
                    <div className="grow">{device.friendly_name}</div>
                    <span className="badge badge-ghost">
                        <Lqi value={relation.linkquality} />
                    </span>
                    <span className="badge badge-ghost" title={t("depth")}>
                        <FontAwesomeIcon icon={faRoute} />
                        {relation.depth === 255 ? "N/A" : relation.depth}
                    </span>
                </summary>
                <ul>
                    <li>
                        <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover">
                            {t("zigbee:ieee_address")}: {device.ieee_address}
                        </Link>
                    </li>
                    <li>
                        <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover">
                            {t("zigbee:network_address")}: {toHex(device.network_address, 4)} ({device.network_address})
                        </Link>
                    </li>
                    {relation.routes.length > 0 && (
                        <>
                            <li>
                                <span>{t("routes")}:</span>
                            </li>
                            <ul>
                                {relation.routes.map((route) => (
                                    <li key={`${relation.source.ieeeAddr}-${route.destinationAddress}-${route.nextHop}-${route.status}`}>
                                        <span>
                                            ➥ {toHex(route.destinationAddress)} : {route.status}
                                            {/** XXX: Z2M currently removes non-ACTIVE status */}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </ul>
            </details>
        </li>
    );
});

export default RawRelation;
