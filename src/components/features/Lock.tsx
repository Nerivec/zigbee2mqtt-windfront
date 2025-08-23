import type { LockFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

type LockProps = BaseWithSubFeaturesProps<WithAnySubFeatures<LockFeature>>;

export default function Lock(props: LockProps) {
    return <FeatureSubFeatures {...props} />;
}
