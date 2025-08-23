import type { CoverFeature, WithAnySubFeatures } from "../../types.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

const STEPS_CONFIG = {
    position: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({ value: item, name: `${item}` })),
    tilt: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({ value: item, name: `${item}` })),
};

type CoverProps = BaseWithSubFeaturesProps<WithAnySubFeatures<CoverFeature>>;

export default function Cover(props: CoverProps) {
    return <FeatureSubFeatures {...props} steps={STEPS_CONFIG} />;
}
