import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import camelCase from "lodash/camelCase.js";
import startCase from "lodash/startCase.js";
import { memo, type PropsWithChildren, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type ColorFeature, FeatureAccessMode, type FeatureWithAnySubFeatures } from "../../types.js";
import Button from "../Button.js";
import { getFeatureIcon } from "./index.js";

export type FeatureWrapperProps = {
    feature: FeatureWithAnySubFeatures;
    parentFeatures: FeatureWithAnySubFeatures[];
    deviceValue?: unknown;
    onRead?(property: Record<string, unknown>): void;
};

function isColorFeature(feature: FeatureWithAnySubFeatures): feature is ColorFeature {
    return feature.type === "composite" && (feature.name === "color_xy" || feature.name === "color_hs");
}

const FeatureWrapper = memo((props: PropsWithChildren<FeatureWrapperProps>) => {
    const { t } = useTranslation(["featureDescriptions", "featureNames", "zigbee"]);
    const { children, feature, deviceValue, onRead } = props;
    // @ts-expect-error `undefined` is fine
    const unit = feature.unit as string | undefined;
    const fi = useMemo(() => getFeatureIcon(feature.name, deviceValue, unit), [unit, feature.name, deviceValue]);
    const isReadable = useMemo(() => (feature.property && feature.access & FeatureAccessMode.GET) || isColorFeature(feature), [feature]);
    const parentFeature = props.parentFeatures?.[props.parentFeatures.length - 1];
    const featureName = feature.name === "state" ? feature.property : feature.name;
    let label = feature.label || t(`featureNames:${featureName}`, { defaultValue: startCase(camelCase(featureName)) });

    if (parentFeature?.label && feature.name === "state" && parentFeature.type !== "light" && parentFeature.type !== "switch") {
        label = `${parentFeature.label} ${feature.label.charAt(0).toLowerCase()}${feature.label.slice(1)}`;
    }

    const onSyncClick = useCallback(
        (item: FeatureWithAnySubFeatures) => {
            if (item.property) {
                onRead?.({ [item.property]: "" });
            }
        },
        [onRead],
    );

    return (
        <div className="list-row p-3">
            <div>
                <FontAwesomeIcon icon={fi[0]} fixedWidth className={fi[1]} {...fi[2]} size="2xl" />
            </div>
            <div>
                <div>
                    {label}
                    {feature.endpoint ? ` (${t("zigbee:endpoint")}: ${feature.endpoint})` : ""}
                </div>
                <div className="text-xs font-semibold opacity-60">{feature.description && t(feature.description)}</div>
            </div>
            <div className="list-col-wrap flex flex-col gap-2">{children}</div>
            {isReadable && (
                <Button<FeatureWithAnySubFeatures> item={feature} onClick={onSyncClick} className="btn btn-xs btn-square btn-primary">
                    <FontAwesomeIcon icon={faSync} />
                </Button>
            )}
        </div>
    );
});

export default FeatureWrapper;
