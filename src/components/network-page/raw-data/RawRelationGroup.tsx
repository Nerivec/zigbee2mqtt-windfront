import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import type { Device } from "../../../types.js";
import { ZigbeeRelationship } from "../index.js";
import RawRelation from "./RawRelation.js";

type RawRelationGroupProps = {
    sourceIdx: number;
    devices: Device[];
    relationship: string;
    relations: Zigbee2MQTTNetworkMap["links"];
    highlight: (friendlyName: string) => boolean;
    setHighlightValue: (friendlyName: string) => void;
};

const ZIGBEE_RELATIONSHIP_TMAP = {
    [ZigbeeRelationship.NeighborIsParent]: "parent",
    [ZigbeeRelationship.NeighborIsAChild]: "children",
    [ZigbeeRelationship.NeighborIsASibling]: "siblings",
    [ZigbeeRelationship.NoneOfTheAbove]: "zigbee:none",
    // Z2M is currently skipping > 3, so this is never present
    [ZigbeeRelationship.NeighborIsPreviousChild]: "previous_children",
};

const RawRelationGroup = memo(({ sourceIdx, devices, relationship, relations, highlight, setHighlightValue }: RawRelationGroupProps) => {
    const { t } = useTranslation(["network", "zigbee"]);

    return (
        <li>
            <details>
                <summary>
                    {t(ZIGBEE_RELATIONSHIP_TMAP[relationship])} ({relations.length})
                </summary>
                <ul>
                    {relations.map((relation) => {
                        const device = devices.find((device) => device.ieee_address === relation.source.ieeeAddr);

                        return device ? (
                            <RawRelation
                                key={`${relation.source.ieeeAddr}-${relation.target.ieeeAddr}`}
                                sourceIdx={sourceIdx}
                                relation={relation}
                                device={device}
                                highlight={highlight}
                                setHighlightValue={setHighlightValue}
                            />
                        ) : (
                            <li key={`${relation.source.ieeeAddr}-${relation.target.ieeeAddr}`}>
                                {t("zigbee:unknown")}: {relation.source.ieeeAddr}
                            </li>
                        );
                    })}
                </ul>
            </details>
        </li>
    );
});

export default RawRelationGroup;
