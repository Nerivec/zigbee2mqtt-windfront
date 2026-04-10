import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import type { Device } from "../../../types.js";
import { ZigbeeRelationship } from "../index.js";
import RawRelation from "./RawRelation.js";

type RawRelationGroupProps = {
    sourceIdx: number;
    devices: Device[];
    relationship: number;
    relations: Zigbee2MQTTNetworkMap["links"];
    highlight: (friendlyName: string) => boolean;
    setHighlightValue: (friendlyName: string) => void;
};

const ZIGBEE_RELATIONSHIP_TMAP = {
    [ZigbeeRelationship.NeighborIsParent]: "parent" as const,
    [ZigbeeRelationship.NeighborIsAChild]: "children" as const,
    [ZigbeeRelationship.NeighborIsASibling]: "siblings" as const,
    [ZigbeeRelationship.NoneOfTheAbove]: "none" as const,
    // Z2M is currently skipping > 3, so this is never present
    [ZigbeeRelationship.NeighborIsPreviousChild]: "previous_children" as const,
};

const RawRelationGroup = memo(({ sourceIdx, devices, relationship, relations, highlight, setHighlightValue }: RawRelationGroupProps) => {
    const { t } = useTranslation(["network", "zigbee"]);
    const relationshipType = ZIGBEE_RELATIONSHIP_TMAP[relationship as keyof typeof ZIGBEE_RELATIONSHIP_TMAP];

    return (
        <li>
            <details>
                <summary>
                    {relationshipType === "none" ? t(($) => $.none, { ns: "zigbee" }) : t(($) => $[relationshipType as keyof (typeof $)["network"]])}{" "}
                    ({relations.length})
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
                                {t(($) => $.unknown, { ns: "zigbee" })}: {relation.source.ieeeAddr}
                            </li>
                        );
                    })}
                </ul>
            </details>
        </li>
    );
});

export default RawRelationGroup;
