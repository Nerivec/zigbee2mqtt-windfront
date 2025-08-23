import type { SwitchFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

type SwitchProps = BaseWithSubFeaturesProps<WithAnySubFeatures<SwitchFeature>>;

export default function Switch(props: SwitchProps) {
    return <FeatureSubFeatures {...props} />;
}
