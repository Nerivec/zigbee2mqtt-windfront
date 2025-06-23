import { memo } from "react";
import { FeatureAccessMode, type NumericFeature } from "../../types.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import RangeEditor from "../editors/RangeEditor.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

interface NumericProps extends BaseFeatureProps<NumericFeature> {
    steps?: ValueWithLabelOrPrimitive[];
}

const Numeric = memo((props: NumericProps) => {
    const {
        feature: { presets, access = FeatureAccessMode.SET, property, unit, value_max: valueMax, value_min: valueMin, value_step: valueStep },
        deviceValue,
        steps,
        onChange,
        minimal,
    } = props;

    if (access & FeatureAccessMode.SET) {
        return (
            <RangeEditor
                onChange={(value) => onChange({ [property]: value })}
                value={(deviceValue as number) ?? ""}
                min={valueMin}
                max={valueMax}
                step={valueStep}
                steps={presets?.length ? (presets as ValueWithLabelOrPrimitive[]) /* typing failure */ : steps}
                unit={unit}
                minimal={minimal}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default Numeric;
