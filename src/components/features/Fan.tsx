import type { FanFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

type FanProps = BaseWithSubFeaturesProps<WithAnySubFeatures<FanFeature>>;

export default function Fan(props: FanProps) {
    return <FeatureSubFeatures {...props} />;
}
