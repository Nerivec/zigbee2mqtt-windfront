import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GradientFeature } from "../../types.js";
import Button from "../Button.js";
import ColorEditor from "../editors/ColorEditor.js";
import type { BaseFeatureProps } from "./index.js";

type GradientProps = BaseFeatureProps<GradientFeature>;

export const Gradient = memo((props: GradientProps) => {
    const {
        minimal,
        onChange,
        feature: { length_min, length_max, property },
        deviceValue,
    } = props;
    const { t } = useTranslation(["gradient", "common"]);
    const [colors, setColors] = useState<Array<string>>(length_min > 0 ? Array(length_min).fill("#ffffff") : []);

    useEffect(() => {
        if (deviceValue && Array.isArray(deviceValue) && deviceValue.length > 0) {
            setColors(deviceValue);
        }
    }, [deviceValue]);

    const setColor = useCallback(
        (idx: number, hex: string) => {
            const c = Array.from(colors);
            c[idx] = hex;
            setColors(c);
        },
        [colors],
    );

    const addColor = useCallback(() => {
        const c = Array.from(colors);
        c.push("#ffffff");
        setColors(c);
    }, [colors]);

    const removeColor = useCallback(
        (idx: number) => {
            const c = Array.from(colors);
            c.splice(idx, 1);
            setColors(c);
        },
        [colors],
    );

    const onGradientApply = useCallback(() => onChange({ [property ?? "gradient"]: colors }), [colors, property, onChange]);

    const [canAdd, setCanAdd] = useState(false);
    const [canRemove, setCanRemove] = useState(false);

    useEffect(() => {
        setCanAdd(colors.length < length_max);
        setCanRemove(colors.length > length_min);
    }, [colors, length_min, length_max]);

    return (
        <div className="flex flex-col gap-2">
            {colors.map((color, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: not much data
                <div key={`${color}-${idx}`} className="flex flex-row flex-wrap gap-2 items-center">
                    <ColorEditor
                        onChange={(color: { hex: string }) => {
                            setColor(idx, color.hex);
                        }}
                        value={color}
                        format="hex"
                    />
                    {canRemove && (
                        <Button<void> className="btn btn-error" onClick={() => removeColor(idx)}>
                            -
                        </Button>
                    )}
                </div>
            ))}
            {canAdd && (
                <div className="flex flex-row flex-wrap gap-2">
                    <Button<void> className="btn btn-success" onClick={addColor}>
                        +
                    </Button>
                </div>
            )}
            <div>
                <Button className={`btn btn-primary ${minimal ? " btn-sm" : ""}`} onClick={onGradientApply}>
                    {t("common:apply")}
                </Button>
            </div>
        </div>
    );
});
