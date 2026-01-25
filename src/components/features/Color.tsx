import { memo, useCallback, useMemo } from "react";
import type { AnyColor, ColorFeature } from "../../types.js";
import ColorEditor from "../editors/ColorEditor.js";
import { getDeviceGamut } from "../editors/index.js";
import type { BaseFeatureProps } from "./index.js";

type ColorProps = BaseFeatureProps<ColorFeature>;

const Color = memo((props: ColorProps) => {
    const {
        device,
        deviceValue,
        feature: { name, features, property },
        onChange,
        minimal,
        batched,
        sourceIdx,
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

    const gamut = useMemo(() => {
        if (device.definition) {
            return getDeviceGamut(device.definition.vendor, device.definition.description);
        }

        return "cie1931";
    }, [device.definition]);

    const onEditorChange = useCallback(
        (color: AnyColor, transactionId?: string) => onChange({ [property ?? "color"]: color }, transactionId),
        [property, onChange],
    );

    return (
        <ColorEditor onChange={onEditorChange} value={value} format={name} minimal={minimal} gamut={gamut} batched={batched} sourceIdx={sourceIdx} />
    );
});

export default Color;
