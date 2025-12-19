import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GradientFeature } from "../../types.js";
import Button from "../Button.js";
import ColorEditor from "../editors/ColorEditor.js";
import { getDeviceGamut } from "../editors/index.js";
import { type BaseFeatureProps, clampList } from "./index.js";

type GradientProps = BaseFeatureProps<GradientFeature>;

const buildDefaultArray = (min: number): string[] => (min > 0 ? Array(min).fill("#ffffff") : []);

export const Gradient = memo((props: GradientProps) => {
    const {
        device,
        minimal,
        onChange,
        feature: { length_min, length_max, property },
        deviceValue,
    } = props;
    const { t } = useTranslation("common");
    const [colors, setColors] = useState<string[]>(buildDefaultArray(length_min));
    const [canAdd, setCanAdd] = useState(false);
    const [canRemove, setCanRemove] = useState(false);

    useEffect(() => {
        if (deviceValue && Array.isArray(deviceValue)) {
            setColors(clampList(deviceValue, length_min, length_max, (min) => buildDefaultArray(min)));
        } else {
            setColors(buildDefaultArray(length_min));
        }
    }, [deviceValue, length_min, length_max]);

    useEffect(() => {
        setCanAdd(colors.length < length_max);
        setCanRemove(colors.length > length_min);
    }, [colors, length_min, length_max]);

    const gamut = useMemo(() => {
        if (device.definition) {
            return getDeviceGamut(device.definition.vendor, device.definition.description);
        }

        return "cie1931";
    }, [device.definition]);

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
        <>
            {colors.map((color, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: not much data
                <div key={`${color}-${idx}`} className="flex flex-row flex-wrap gap-2 items-center">
                    <ColorEditor
                        onChange={(newColor: { hex: string }) => {
                            setColor(idx, newColor.hex);
                        }}
                        value={{ hex: color }}
                        format="hex"
                        gamut={gamut}
                        minimal={minimal}
                    />
                    {canRemove && (
                        <Button<number> item={idx} className="btn btn-sm btn-error" onClick={removeColor}>
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
                    {t(($) => $.apply)}
                </Button>
            </div>
        </>
    );
});
