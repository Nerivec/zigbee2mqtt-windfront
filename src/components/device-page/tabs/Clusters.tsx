import { faArrowCircleLeft, faArrowCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../../types.js";

interface ClustersProps {
    device: Device;
}

export default function Clusters({ device }: ClustersProps) {
    const { t } = useTranslation("zigbee");

    const clustersByEndpoint = useMemo(() => {
        const clusters: JSX.Element[] = [];

        for (const endpointId in device.endpoints) {
            const endpoint = device.endpoints[endpointId];

            clusters.push(
                <li key={endpointId}>
                    <details open>
                        <summary>
                            {t(($) => $.endpoint)} {endpointId}
                        </summary>
                        <ul>
                            <li>
                                <details>
                                    <summary>
                                        <FontAwesomeIcon icon={faArrowCircleLeft} /> {t(($) => $.output_clusters)}
                                    </summary>
                                    <ul>
                                        {endpoint.clusters.output.map((cluster) => (
                                            <li key={cluster}>
                                                <span className="cursor-text select-text">{cluster}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <details>
                                    <summary>
                                        <FontAwesomeIcon icon={faArrowCircleRight} /> {t(($) => $.input_clusters)}
                                    </summary>
                                    <ul>
                                        {endpoint.clusters.input.map((cluster) => (
                                            <li key={cluster}>
                                                <span className="cursor-text select-text">{cluster}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </li>
                        </ul>
                    </details>
                </li>,
            );
        }

        return clusters;
    }, [device.endpoints, t]);

    return <ul className="menu bg-base-100 w-full">{clustersByEndpoint}</ul>;
}
