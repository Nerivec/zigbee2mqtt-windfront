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
        const sanitizedDeviceValue = deviceValue != null && typeof deviceValue === "object" ? deviceValue : {};

        for (const innerFeature of features) {
            // just in case the number comes in as string
            const propValue = Number.parseFloat(sanitizedDeviceValue[innerFeature.name]);

            val[innerFeature.name] = Number.isNaN(propValue) ? 0 : propValue;
        }

        return val;
    }, [deviceValue, features]);

    const onEditorChange = useCallback((color: AnyColor) => onChange({ [property ?? "color"]: color }), [property, onChange]);

    return <ColorEditor onChange={onEditorChange} value={value} format={name} minimal={minimal} />;
});

export default Color;
