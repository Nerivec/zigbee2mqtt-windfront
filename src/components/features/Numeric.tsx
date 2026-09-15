import { memo } from "react";
import useTemperatureUnit from "../../hooks/useTemperatureUnit.js";
import {
    convertTemperature,
    convertTemperatureToNative,
    isTemperatureDelta,
    snapTemperatureToStep,
    temperatureUnitLabel,
} from "../../temperature.js";
import { FeatureAccessMode, type NumericFeature } from "../../types.js";
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
        feature: { presets, access = FeatureAccessMode.SET, property, unit, value_max: valueMax, value_min: valueMin, value_step: valueStep },
        device,
        deviceValue,
        steps,
        onChange,
        minimal,
    } = props;
    const temperatureUnit = useTemperatureUnit(device, props.feature);
    const temperatureDelta = isTemperatureDelta(props.feature);
    const convertedUnit = temperatureUnitLabel(temperatureUnit, unit);
    const conversionActive = convertedUnit !== unit;
    const convertToDisplay = (value: number) => convertTemperature(value, unit ?? "", temperatureUnit, temperatureDelta);
    const convertedValue = typeof deviceValue === "number" ? convertToDisplay(deviceValue) : deviceValue;
    const convertedMin = typeof valueMin === "number" ? convertToDisplay(valueMin) : valueMin;
    const convertedMax = typeof valueMax === "number" ? convertToDisplay(valueMax) : valueMax;
    const convertedStep = typeof valueStep === "number" ? convertTemperature(valueStep, unit ?? "", temperatureUnit, true) : valueStep;
    const convertedSteps = (presets?.length ? (presets as ValueWithLabelOrPrimitive[]) /* typing failure */ : steps)?.map((step) => {
        if (typeof step === "number") {
            return convertToDisplay(step);
        }

        return typeof step === "object" ? { ...step, value: convertToDisplay(step.value) } : step;
    });

    if (access & FeatureAccessMode.SET) {
        return (
            <RangeEditor
                onChange={async (value) => {
                    const nativeValue =
                        typeof value === "number" ? convertTemperatureToNative(value, unit ?? "", temperatureUnit, temperatureDelta) : value;
                    const converted =
                        conversionActive && typeof nativeValue === "number" ? snapTemperatureToStep(nativeValue, valueStep, valueMin) : nativeValue;

                    await onChange(property ? { [property]: converted } : converted);
                }}
                value={typeof convertedValue === "number" ? convertedValue : ""}
                min={convertedMin}
                max={convertedMax}
                step={convertedStep}
                inputStep={conversionActive ? "any" : undefined}
                steps={convertedSteps}
                unit={convertedUnit}
                minimal={minimal}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} feature={{ ...props.feature, unit: convertedUnit }} deviceValue={convertedValue} />;
    }

    return <NoAccessError {...props} />;
});

export default Numeric;
