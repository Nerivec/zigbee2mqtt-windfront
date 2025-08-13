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
    const [colors, setColors] = useState<string[]>(length_min > 0 ? Array(length_min).fill("#ffffff") : []);
    const [canAdd, setCanAdd] = useState(false);
    const [canRemove, setCanRemove] = useState(false);

    useEffect(() => {
        if (deviceValue && Array.isArray(deviceValue) && deviceValue.length > 0) {
            setColors(deviceValue);
        }
    }, [deviceValue]);

    useEffect(() => {
        setCanAdd(colors.length < length_max);
        setCanRemove(colors.length > length_min);
    }, [colors, length_min, length_max]);

    const setColor = useCallback((idx: number, hex: string) => {
        setColors((prev) => {
            const c = Array.from(prev);
            c[idx] = hex;

            return c;
        });
    }, []);

    const addColor = useCallback(() => {
        setColors((prev) => [...prev, "#ffffff"]);
    }, []);

    const removeColor = useCallback((idx: number) => {
        setColors((prev) => {
            const c = Array.from(prev);
            c.splice(idx, 1);

            return c;
        });
    }, []);

    const onGradientApply = useCallback(() => onChange({ [property ?? "gradient"]: colors }), [colors, property, onChange]);

    return (
        <div className="flex flex-col gap-2">
            {colors.map((color, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: not much data
                <div key={`${color}-${idx}`} className="flex flex-row flex-wrap gap-2 items-center">
                    <ColorEditor
                        onChange={(newColor: { hex: string }) => {
                            setColor(idx, newColor.hex);
                        }}
                        value={{ hex: color }}
                        format="hex"
                        minimal={minimal}
                    />
                    {canRemove && (
                        <Button<void> className="btn btn-sm btn-error" onClick={() => removeColor(idx)}>
                            -
                        </Button>
                    )}
                </div>
            ))}
            {canAdd && (
                <div className="flex flex-row flex-wrap gap-2">
                    <Button<void> className="btn btn-sm btn-success" onClick={addColor}>
                        +
                    </Button>
                </div>
            )}
            <div>
                <Button className={`btn btn-primary ${minimal ? "btn-sm" : ""}`} onClick={onGradientApply}>
                    {t("common:apply")}
                </Button>
            </div>
        </div>
    );
});
