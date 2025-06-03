import { memo, useCallback, useMemo } from "react";
import type { AnyColor, ColorFeature } from "../../types.js";
import ColorEditor from "../editors/ColorEditor.js";
import type { BaseFeatureProps } from "./index.js";

type ColorProps = BaseFeatureProps<ColorFeature>;

const Color = memo((props: ColorProps) => {
    const {
        deviceValue,
        feature: { name, features, property },
        onChange,
        minimal,
    } = props;

    const value = useMemo(() => {
        const val = {} as AnyColor;

        for (const innerFeature of features) {
            val[innerFeature.name] = deviceValue?.[innerFeature.property] ?? 0;
        }

        return val;
    }, [deviceValue, features]);

    const onEditorChange = useCallback((color: AnyColor | { hex: string }) => onChange({ [property ?? "color"]: color }), [property, onChange]);

    return <ColorEditor onChange={onEditorChange} value={value} format={name} minimal={minimal} />;
});

export default Color;
