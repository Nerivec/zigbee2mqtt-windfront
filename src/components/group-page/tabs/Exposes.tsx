import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import type { FeatureWithAnySubFeatures, Group } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import Feature from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";
import { getFeatureKey } from "../../features/index.js";

type ExposesProps = {
    sourceIdx: number;
    group: Group;
};

/**
 * Use non-clashing Map keys.
 * NOTE: fallback to `type` because despite the ZHC typing, `name` isn't actually always defined
 */
const getFeatureId = (feature: FeatureWithAnySubFeatures) =>
    feature.property ? `__property_${feature.property}` : feature.name ? `__name_${feature.name}` : `__type_${feature.type}`;

/**
 * Recursively find common features to a reference set (including sub-features if any).
 * Returns a list of cloned features, with possible sub-features.
 */
const findCommonFeatures = (
    refFeatures: FeatureWithAnySubFeatures[],
    otherFeatureMaps: Map<string, FeatureWithAnySubFeatures>[],
): FeatureWithAnySubFeatures[] => {
    const common: FeatureWithAnySubFeatures[] = [];

    for (const refFeature of refFeatures) {
        const refId = getFeatureId(refFeature);
        const matchingFeatures: FeatureWithAnySubFeatures[] = [];

        // check if feature exists in all other devices
        for (const otherFeatureMap of otherFeatureMaps) {
            const match = otherFeatureMap.get(refId);

            if (!match) {
                continue;
            }

            matchingFeatures.push(match);
        }

        if (matchingFeatures.length === 0) {
            continue;
        }

        // clone the feature
        const commonFeature = { ...refFeature };

        // if feature has sub-features, recursively find common ones
        if ("features" in refFeature && refFeature.features.length > 0) {
            const otherSubFeaturesMaps: Map<string, FeatureWithAnySubFeatures>[] = [];

            for (const matchingFeature of matchingFeatures) {
                if ("features" in matchingFeature) {
                    otherSubFeaturesMaps.push(new Map((matchingFeature.features as FeatureWithAnySubFeatures[]).map((f) => [getFeatureId(f), f])));
                }
            }

            const commonSubFeatures = findCommonFeatures(refFeature.features as FeatureWithAnySubFeatures[], otherSubFeaturesMaps);

            // only include feature if it has common sub-features
            if (commonSubFeatures.length > 0) {
                // check is superfluous, already done in wrapping if, just with the original (only required by typing)
                if ("features" in commonFeature) {
                    commonFeature.features = commonSubFeatures;
                }

                common.push(commonFeature);
            }
        } else {
            common.push(commonFeature);
        }
    }

    return common;
};

export default function Exposes({ sourceIdx, group }: ExposesProps) {
    const { t } = useTranslation("common");
    const devices = useAppStore(useShallow((state) => state.devices[sourceIdx]));
    const deviceScenesFeatures = useAppStore(useShallow((state) => state.deviceScenesFeatures[sourceIdx]));
    const firstMember = group.members.length > 0 ? group.members[0] : undefined;
    const refDevice = firstMember ? devices.find((d) => d.ieee_address === firstMember.ieee_address) : undefined;
    const refEndpointName = refDevice && firstMember ? refDevice.endpoints[firstMember.endpoint]?.name : undefined;

    const groupData = useMemo(() => {
        if (!refDevice) {
            return [];
        }

        const refFeatures = deviceScenesFeatures[refDevice.ieee_address] ?? [];

        if (refFeatures.length === 0) {
            return [];
        }

        const refEndpointFeatures = refFeatures.filter(
            // XXX: show if feature has no endpoint?
            (f) => !f.endpoint || Number(f.endpoint) === firstMember?.endpoint || f.endpoint === refEndpointName,
        );

        if (group.members.length === 1) {
            return refEndpointFeatures;
        }

        const otherMembersFeatures: Map<string, FeatureWithAnySubFeatures>[] = [];

        for (let i = 1; i < group.members.length; i++) {
            const member = group.members[i];
            const memberFeatures = deviceScenesFeatures[member.ieee_address];

            if (!memberFeatures || memberFeatures.length === 0) {
                return [];
            }

            const memberEndpointFeaturesMap = new Map<string, FeatureWithAnySubFeatures>();

            for (const memberFeature of memberFeatures) {
                // XXX: show if feature has no endpoint?
                if (
                    !memberFeature.endpoint ||
                    Number(memberFeature.endpoint) === member.endpoint ||
                    memberFeature.endpoint === refDevice.endpoints[member.endpoint]?.name
                ) {
                    memberEndpointFeaturesMap.set(getFeatureId(memberFeature), memberFeature);
                }
            }

            otherMembersFeatures.push(memberEndpointFeaturesMap);
        }

        return findCommonFeatures(refEndpointFeatures, otherMembersFeatures);
    }, [firstMember?.endpoint, refDevice, refEndpointName, deviceScenesFeatures, group.members]);

    const onChange = useCallback(
        async (value: Record<string, unknown>) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${group.id}/set`,
                value,
            );
        },
        [sourceIdx, group.id],
    );

    const onRead = useCallback(
        async (value: Record<string, unknown>) => {
            await sendMessage<"{friendlyNameOrId}/get">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${group.id}/get`,
                value,
            );
        },
        [sourceIdx, group.id],
    );

    return refDevice && groupData.length > 0 ? (
        <div className="list bg-base-100">
            {groupData.map((expose) => (
                <Feature
                    key={getFeatureKey(expose)}
                    feature={expose}
                    device={refDevice}
                    deviceState={{}}
                    onChange={onChange}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                    parentFeatures={[]}
                />
            ))}
        </div>
    ) : (
        t(($) => $.empty_exposes_definition)
    );
}
