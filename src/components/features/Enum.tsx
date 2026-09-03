import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type EnumFeature, FeatureAccessMode } from "../../types.js";
import { getExposeValueLabel } from "../../utils/exposeTranslations.js";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type EnumProps = BaseFeatureProps<EnumFeature>;
const BIG_ENUM_SIZE = 6;

const Enum = memo((props: EnumProps) => {
    const {
        onChange,
        feature,
        feature: { access = FeatureAccessMode.SET, values, property },
        deviceValue,
        minimal,
    } = props;
    const { i18n } = useTranslation();
    const locale = i18n.language?.split("-")[0] ?? "en";

    const translatedValues: ValueWithLabelOrPrimitive[] = useMemo(() => {
        const translations = (feature as {translations?: Record<string, {values?: Record<string, string>}>}).translations;
        return (values as (string | number)[]).map((v) => {
            const str = String(v);
            return {value: v as unknown as number, name: getExposeValueLabel(str, translations, locale)};
        });
    }, [values, feature, locale]);

    if (access & FeatureAccessMode.SET) {
        return (
            <EnumEditor
                onChange={(value) => onChange(property ? { [property]: value } : value)}
                values={translatedValues}
                value={
                    deviceValue != null && (typeof deviceValue === "string" || typeof deviceValue === "number" || typeof deviceValue === "object")
                        ? (deviceValue as ValueWithLabelOrPrimitive)
                        : ""
                }
                minimal={minimal || (values as unknown[]).length > BIG_ENUM_SIZE}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default Enum;
