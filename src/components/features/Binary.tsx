import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type BinaryFeature, FeatureAccessMode } from "../../types.js";
import Button from "../Button.js";
import { useEditorState } from "../editors/useEditorState.js";
import DisplayValue from "../value-decorators/DisplayValue.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type BinaryProps = BaseFeatureProps<BinaryFeature>;

const Binary = memo((props: BinaryProps & { hasLocalChange?: boolean }) => {
    const {
        feature: { access = FeatureAccessMode.SET, name, property, value_off: valueOff, value_on: valueOn },
        deviceValue,
        onChange,
        minimal,
        batched,
        hasLocalChange,
    } = props;
    const { t } = useTranslation("zigbee");

    // Track the selected value for state machine
    const [selectedValue, setSelectedValue] = useState<string | boolean | null>(
        deviceValue === valueOn ? valueOn : deviceValue === valueOff ? valueOff : null,
    );

    // Wrapper to send value in the expected format
    const handleChange = useCallback(
        (value: string | boolean | null) => {
            if (value !== null) {
                onChange(property ? { [property]: value } : value);
            }
        },
        [property, onChange],
    );

    const { sentValue, isConfirmed, isConflict, isTimedOut, isPending, isReading, readTimedOut, submit, getToggleClass } = useEditorState<
        string | boolean | null
    >({
        value: deviceValue === valueOn ? valueOn : deviceValue === valueOff ? valueOff : null,
        currentValue: selectedValue,
        onChange: handleChange,
        isEqual: (a, b) => a === b,
        batched,
    });

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

    // Sync selected value from device value when not pending
    useEffect(() => {
        if (!isPending && !isConflict && !isTimedOut && sentValue === null) {
            setSelectedValue(deviceValue === valueOn ? valueOn : deviceValue === valueOff ? valueOff : null);
        }
    }, [deviceValue, valueOn, valueOff, isPending, isConflict, isTimedOut, sentValue]);

    const onButtonClick = useCallback(
        (value: string | boolean) => {
            setSelectedValue(value);
            submit(value);
        },
        [submit],
    );

    const onCheckboxChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const checkedValue = e.target.checked ? valueOn : valueOff;
            setSelectedValue(checkedValue);
            submit(checkedValue);
        },
        [valueOn, valueOff, submit],
    );

    // Style for buttons based on state
    const getButtonStyle = (isActive: boolean) => {
        const base = "btn btn-link";
        if (readTimedOut) return `${base} text-error`;
        if (isReading) return `${base} text-warning`;
        if (isActive && isConfirmed) return `${base} text-success`;
        if (isConflict || isTimedOut) return `${base} text-error`;
        if (isPending) return `${base} text-warning`;
        if (hasLocalChange && isActive) return `${base} text-warning`;
        return base;
    };

    if (access & FeatureAccessMode.SET) {
        const valueExists = deviceValue != null;
        const showOnOffButtons = !minimal || (minimal && !valueExists);

        return (
            <div className={`flex flex-row items-center gap-3 w-full ${isPending || isReading ? "animate-pulse" : ""}`}>
                <div className="flex flex-row items-center gap-1 flex-1">
                    {showOnOffButtons && (
                        <Button<string | boolean> className={getButtonStyle(selectedValue === valueOff)} item={valueOff} onClick={onButtonClick}>
                            <DisplayValue value={valueOff} name={name} />
                        </Button>
                    )}
                    {valueExists ? (
                        <input
                            className={`toggle ${hasLocalChange ? "toggle-warning" : getToggleClass()}`}
                            type="checkbox"
                            checked={selectedValue === valueOn}
                            onChange={onCheckboxChange}
                        />
                    ) : (
                        <span className="tooltip" data-tip={t(($) => $.unknown)}>
                            <FontAwesomeIcon icon={faQuestion} />
                        </span>
                    )}
                    {showOnOffButtons && (
                        <Button<string | boolean> className={getButtonStyle(selectedValue === valueOn)} item={valueOn} onClick={onButtonClick}>
                            <DisplayValue value={valueOn} name={name} />
                        </Button>
                    )}
                </div>
                {/* Status indicator - green tick for confirmed (auto-hides after 3s in minimal mode) */}
                {(minimal ? showTick : isConfirmed) && (
                    <span className="text-success text-lg" title="Device confirmed value">
                        ✓
                    </span>
                )}
            </div>
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default Binary;
