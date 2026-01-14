import {
    type ChangeEvent,
    type DetailedHTMLProps,
    type FocusEvent,
    type InputHTMLAttributes,
    type KeyboardEvent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
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
    SUPPORTED_GAMUTS,
    type ZigbeeColor,
} from "./index.js";
import { useEditorState } from "./useEditorState.js";

type ColorEditorProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: AnyColor;
    format: ColorFormat;
    gamut: keyof typeof SUPPORTED_GAMUTS;
    onChange(color: AnyColor): void;
    minimal?: boolean;
    /** When true, changes are batched (Apply button) - only show editing state */
    batched?: boolean;
};

type ColorInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label: string;
    stateClass?: string;
};

const SATURATION_BACKGROUND_IMAGE = "linear-gradient(to right, white, transparent)";
const HUE_BACKGROUND_IMAGE =
    "linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0))";

const ColorInput = memo(({ label, stateClass, ...rest }: ColorInputProps) => (
    <label className={`input ${stateClass || ""}`}>
        {label}
        <input type="text" className="grow" {...rest} />
    </label>
));

// Deep equality for color objects
const colorIsEqual = (a: AnyColor | null, b: AnyColor | null): boolean => {
    if (a === null || b === null) return a === b;
    return JSON.stringify(a) === JSON.stringify(b);
};

const ColorEditor = memo(({ onChange, value: initialValue = {} as AnyColor, format, gamut, minimal, batched }: ColorEditorProps) => {
    const [gamutKey, setGamutKey] = useState<keyof typeof SUPPORTED_GAMUTS>(gamut in SUPPORTED_GAMUTS ? gamut : "cie1931");
    const selectedGamut = SUPPORTED_GAMUTS[gamutKey];
    const [color, setColor] = useState(convertToColor(initialValue, format, selectedGamut));
    const [colorString, setColorString] = useState(convertColorToString(color));
    const [inputStates, setInputStates] = useState({
        color_rgb: false,
        color_hs: false,
        color_xy: false,
        hex: false,
    });
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track the value we want to send (for comparison with device response)
    const colorToSend = useMemo(() => convertFromColor(color, format), [color, format]);

    const { sentValue, isConfirmed, isConflict, isTimedOut, isPending, isReading, submit, resetForEdit, getInputClass } =
        useEditorState<AnyColor | null>({
            value: initialValue,
            currentValue: colorToSend,
            onChange,
            isEqual: colorIsEqual,
            batched,
        });

    // Track which slider was last modified (for tick placement in minimal mode)
    const [lastModifiedSlider, setLastModifiedSlider] = useState<"saturation" | "hue" | null>(null);

    // Auto-hide confirmation tick after 3 seconds in minimal mode
    const [showTick, setShowTick] = useState(false);
    useEffect(() => {
        if (minimal && isConfirmed) {
            setShowTick(true);
            const timer = setTimeout(() => setShowTick(false), 3000);
            return () => clearTimeout(timer);
        }
        setShowTick(false);
    }, [minimal, isConfirmed]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Sync color from device value when not pending
    useEffect(() => {
        if (!isPending && !isConflict && !isTimedOut && sentValue === null) {
            const newColor = convertToColor(initialValue, format, selectedGamut);
            setColor(newColor);
            setColorString(convertColorToString(newColor));
        }
    }, [initialValue, format, selectedGamut, isPending, isConflict, isTimedOut, sentValue]);

    useEffect(() => {
        setGamutKey(gamut);
    }, [gamut]);

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
                setColor(convertStringToColor(colorHsString, "color_hs", selectedGamut));
                setLastModifiedSlider("saturation");
                resetForEdit();
            }
        },
        [color.color_hs, selectedGamut, resetForEdit],
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
                setColor(convertStringToColor(colorHsString, "color_hs", selectedGamut));
                setLastModifiedSlider("hue");
                resetForEdit();
            }
        },
        [color.color_hs, selectedGamut, resetForEdit],
    );

    const onInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const { value, name } = e.target;

            setColorString((currentColorString) => ({ ...currentColorString, [name]: value }));
            const newColor = convertStringToColor(value, name as ColorFormat, selectedGamut);
            setColor(newColor);
            resetForEdit();

            // Debounce: auto-submit after 2 seconds of no changes
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                const valueToSend = convertFromColor(newColor, format);
                submit(valueToSend);
                debounceRef.current = null;
            }, 2000);
        },
        [selectedGamut, format, resetForEdit, submit],
    );

    const onInputFocus = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInputStates((states) => ({ ...states, [e.target.name]: true }));
    }, []);

    const onInputBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            // Cancel debounce timer since we're submitting now
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            setInputStates((states) => ({ ...states, [e.target.name]: false }));
            submit(colorToSend);
        },
        [colorToSend, submit],
    );

    const onInputKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                // Cancel debounce timer since we're submitting now
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                }
                submit(colorToSend);
                e.currentTarget.blur();
            }
        },
        [colorToSend, submit],
    );

    const onRangeSubmit = useCallback(() => {
        submit(colorToSend);
    }, [colorToSend, submit]);

    const hueBackgroundColor = useMemo(() => `hsl(${color.color_hs[0]}, 100%, 50%)`, [color.color_hs[0]]);

    return (
        <>
            <div className="flex flex-row gap-3 items-center w-full">
                <div className={`flex-1${minimal ? " max-w-xs" : ""} ${isPending || isReading ? "animate-pulse" : ""}`}>
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
                {/* Status indicator - green tick for confirmed (auto-hides after 3s in minimal mode) */}
                {(minimal ? showTick && lastModifiedSlider === "saturation" : isConfirmed && lastModifiedSlider === "saturation") && (
                    <span className="text-success text-lg" title="Device confirmed value">
                        ✓
                    </span>
                )}
            </div>
            <div className="flex flex-row gap-3 items-center w-full">
                <div className={`flex-1${minimal ? " max-w-xs" : ""} ${isPending || isReading ? "animate-pulse" : ""}`}>
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
                {/* Status indicator for hue slider (auto-hides after 3s in minimal mode) */}
                {(minimal ? showTick && lastModifiedSlider === "hue" : isConfirmed && lastModifiedSlider === "hue") && (
                    <span className="text-success text-lg" title="Device confirmed value">
                        ✓
                    </span>
                )}
            </div>
            {!minimal && (
                <div className="flex flex-row flex-wrap gap-2 justify-around items-center">
                    <ColorInput
                        label="hex"
                        name="hex"
                        value={colorString.hex}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                        onKeyDown={onInputKeyDown}
                        stateClass={getInputClass()}
                    />
                    <ColorInput
                        label="rgb"
                        name="color_rgb"
                        value={colorString.color_rgb}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                        onKeyDown={onInputKeyDown}
                        stateClass={getInputClass()}
                    />
                    <ColorInput
                        label="hsv"
                        name="color_hs"
                        value={colorString.color_hs}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                        onKeyDown={onInputKeyDown}
                        stateClass={getInputClass()}
                    />
                    <ColorInput
                        label="xyY"
                        name="color_xy"
                        value={colorString.color_xy}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onBlur={onInputBlur}
                        onKeyDown={onInputKeyDown}
                        stateClass={getInputClass()}
                    />
                </div>
            )}
        </>
    );
});

export default ColorEditor;
