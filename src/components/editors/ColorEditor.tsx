import {
    type ChangeEvent,
    type DetailedHTMLProps,
    type FocusEvent,
    type InputHTMLAttributes,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { AnyColor, ColorFormat } from "../../types.js";
import {
    convertColorToString,
    convertFromColor,
    convertHexToString,
    convertHsvToString,
    convertRgbToString,
    convertStringToColor,
    convertToColor,
    convertXyYToString,
    type ZigbeeColor,
} from "./index.js";

type ColorEditorProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: AnyColor;
    format: ColorFormat;
    onChange(color: AnyColor): void;
    minimal?: boolean;
};

type ColorInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label: string;
};

const SATURATION_BACKGROUND_IMAGE = "linear-gradient(to right, white, transparent)";
const HUE_BACKGROUND_IMAGE =
    "linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0))";

const ColorInput = memo(({ label, ...rest }: ColorInputProps) => (
    <label className="input">
        {label}
        <input type="text" className="grow" {...rest} />
    </label>
));

const ColorEditor = memo((props: ColorEditorProps) => {
    const { onChange, value: initialValue = {} as AnyColor, format, minimal } = props;
    const [color, setColor] = useState(convertToColor(initialValue, format));
    const [colorString, setColorString] = useState(convertColorToString(color));
    const [inputStates, setInputStates] = useState({
        color_rgb: false,
        color_hs: false,
        color_xy: false,
        hex: false,
    });

    useEffect(() => {
        const newColor = convertToColor(initialValue, format);

        setColor(newColor);
        setColorString(convertColorToString(newColor));
    }, [initialValue, format]);

    useEffect(() => {
        if (!inputStates.color_xy) {
            const newColorString = convertXyYToString(color.color_xy);

            setColorString((colorString) => ({ ...colorString, color_xy: newColorString }));
        }
    }, [inputStates.color_xy, color.color_xy]);

    useEffect(() => {
        if (!inputStates.color_hs) {
            const newColorString = convertHsvToString(color.color_hs);

            setColorString((colorString) => ({ ...colorString, color_hs: newColorString }));
        }
    }, [inputStates.color_hs, color.color_hs]);

    useEffect(() => {
        if (!inputStates.color_rgb) {
            const newColorString = convertRgbToString(color.color_rgb);

            setColorString((colorString) => ({ ...colorString, color_rgb: newColorString }));
        }
    }, [inputStates.color_rgb, color.color_rgb]);

    useEffect(() => {
        if (!inputStates.hex) {
            const newColorString = convertHexToString(color.hex);

            setColorString((colorString) => ({ ...colorString, hex: newColorString }));
        }
    }, [inputStates.hex, color.hex]);

    const onSaturationChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.value) {
                const colorHs = Array.from(color.color_hs) as ZigbeeColor["color_hs"];
                colorHs[1] = e.target.valueAsNumber;
                const colorHsString = convertHsvToString(colorHs);

                setColorString((currentColorString) => ({ ...currentColorString, color_hs: colorHsString }));
                setColor(convertStringToColor(colorHsString, "color_hs"));
            }
        },
        [color.color_hs],
    );

    const onHueChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.value) {
                const colorHs = Array.from(color.color_hs) as ZigbeeColor["color_hs"];
                const sat = colorHs[1];
                colorHs[1] = sat === 0 ? 100.0 : sat; // allow click on hue when sat is zero to be applied (otherwise reset)
                colorHs[0] = e.target.valueAsNumber;
                const colorHsString = convertHsvToString(colorHs);

                setColorString((currentColorString) => ({ ...currentColorString, color_hs: colorHsString }));
                setColor(convertStringToColor(colorHsString, "color_hs"));
            }
        },
        [color.color_hs],
    );

    const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { value, name } = e.target;

        setColorString((currentColorString) => ({ ...currentColorString, [name]: value }));
        setColor(convertStringToColor(value, name as ColorFormat));
    }, []);

    const onInputFocus = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInputStates((states) => ({ ...states, [e.target.name]: true }));
    }, []);

    const onInputBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            setInputStates((states) => ({ ...states, [e.target.name]: false }));
            onChange(convertFromColor(color, format));
        },
        [color, format, onChange],
    );

    const onRangeSubmit = useCallback(() => {
        onChange(convertFromColor(color, format));
    }, [color, format, onChange]);

    const hueBackgroundColor = useMemo(() => `hsl(${color.color_hs[0]}, 100%, 50%)`, [color.color_hs[0]]);

    return (
        <>
            <div className="flex flex-row flex-wrap gap-3 items-center">
                <div className={`w-full${minimal ? " max-w-xs" : ""}`}>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={color.color_hs[1]}
                        className={`range [--range-bg:transparent] [--range-fill:0] w-full${minimal ? " range-xs " : ""}`}
                        style={{ backgroundImage: SATURATION_BACKGROUND_IMAGE, backgroundColor: hueBackgroundColor }}
                        onChange={onSaturationChange}
                        onTouchEnd={onRangeSubmit}
                        onMouseUp={onRangeSubmit}
                        onKeyUp={onRangeSubmit}
                    />
                </div>
            </div>
            <div className="flex flex-row flex-wrap gap-3 items-center">
                <div className={`w-full${minimal ? " max-w-xs" : ""}`}>
                    <input
                        type="range"
                        min={0}
                        max={360}
                        value={color.color_hs[0]}
                        className={`range [--range-bg:transparent] [--range-fill:0] w-full${minimal ? " range-xs " : ""}`}
                        style={{ backgroundImage: HUE_BACKGROUND_IMAGE }}
                        onChange={onHueChange}
                        onTouchEnd={onRangeSubmit}
                        onMouseUp={onRangeSubmit}
                        onKeyUp={onRangeSubmit}
                    />
                </div>
            </div>
            {!minimal && (
                <div className="flex flex-row flex-wrap gap-2 justify-around">
                    <ColorInput label="hex" name="hex" value={colorString.hex} onChange={onInputChange} onFocus={onInputFocus} onBlur={onInputBlur} />
                    <ColorInput
                        label="rgb"
                        name="color_rgb"
                        value={colorString.color_rgb}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                    />
                    <ColorInput
                        label="hsv"
                        name="color_hs"
                        value={colorString.color_hs}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                    />
                    <ColorInput
                        label="xyY"
                        name="color_xy"
                        value={colorString.color_xy}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                    />
                </div>
            )}
        </>
    );
});

export default ColorEditor;
