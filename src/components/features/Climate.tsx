import type { ClimateFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

type ClimateProps = BaseWithSubFeaturesProps<WithAnySubFeatures<ClimateFeature>>;

export default function Climate(props: ClimateProps) {
    return <FeatureSubFeatures {...props} />;
}
