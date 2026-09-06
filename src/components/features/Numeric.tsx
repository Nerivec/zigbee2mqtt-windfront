import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FeatureAccessMode, type NumericFeature } from "../../types.js";
import { getExposePresets } from "../../utils/exposeTranslations.js";
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
        feature,
        feature: { presets, access = FeatureAccessMode.SET, property, unit, value_max: valueMax, value_min: valueMin, value_step: valueStep },
        deviceValue,
        steps,
        onChange,
        minimal,
    } = props;
    const { i18n } = useTranslation();
    const locale = i18n.language?.split("-")[0] ?? "en";

    const translatedSteps = useMemo(() => {
        if (!presets?.length) return steps;
        const presetTranslations = getExposePresets(feature, locale);
        if (!presetTranslations) return presets;
        return presets.map((p) => {
            if (typeof p === "number" || typeof p === "string") return p;
            const translated = presetTranslations[p.name];
            return { ...p, name: translated?.name ?? p.name };
        });
    }, [presets, feature, locale, steps]);

    if (access & FeatureAccessMode.SET) {
        return (
            <RangeEditor
                onChange={async (value) => {
                    await onChange(property ? { [property]: value } : value);
                }}
                value={typeof deviceValue === "number" ? deviceValue : ""}
                min={valueMin}
                max={valueMax}
                step={valueStep}
                steps={translatedSteps}
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
