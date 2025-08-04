import { memo } from "react";
import { type EnumFeature, FeatureAccessMode } from "../../types.js";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type EnumProps = BaseFeatureProps<EnumFeature>;
const BIG_ENUM_SIZE = 6;

const Enum = memo((props: EnumProps) => {
    const {
        onChange,
        feature: { access = FeatureAccessMode.SET, values, property },
        deviceValue,
        minimal,
    } = props;

    if (access & FeatureAccessMode.SET) {
        return (
            <EnumEditor
                onChange={(value) => onChange(property ? { [property]: value } : value)}
                values={values}
                value={
                    deviceValue != null && (typeof deviceValue === "string" || typeof deviceValue === "number" || typeof deviceValue === "object")
                        ? (deviceValue as ValueWithLabelOrPrimitive)
                        : ""
                }
                minimal={minimal || values.length > BIG_ENUM_SIZE}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default Enum;
