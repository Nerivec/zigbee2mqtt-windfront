import { memo, useCallback, useEffect, useState } from "react";
import type { BasicFeature, Device, DeviceState, FeatureWithAnySubFeatures, FeatureWithSubFeatures } from "../../types.js";
import Button from "../Button.js";
import Feature from "../features/Feature.js";
import FeatureWrapper from "../features/FeatureWrapper.js";

type ListEditorProps = {
    value: unknown[];
    onChange(value: unknown[]): void;
    feature: BasicFeature | FeatureWithSubFeatures;
    parentFeatures: FeatureWithAnySubFeatures[];
    lengthMin?: number;
    lengthMax?: number;
};

const ListEditor = memo(({ onChange, value, feature, parentFeatures, lengthMin, lengthMax }: ListEditorProps) => {
    const [currentValue, setCurrentValue] = useState<unknown[]>(
        lengthMin !== undefined && lengthMin > 0 ? Array(lengthMin).fill(feature.type === "composite" ? {} : "") : [],
    );
    const [canAdd, setCanAdd] = useState(false);
    const [canRemove, setCanRemove] = useState(false);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        setCanAdd(lengthMax !== undefined && lengthMax > 0 ? currentValue.length < lengthMax : true);
        setCanRemove(lengthMin !== undefined && lengthMin > 0 ? currentValue.length > lengthMin : true);
    }, [currentValue, lengthMin, lengthMax]);

    const onItemChange = useCallback(
        (itemValue: unknown, itemIndex: number) => {
            const newListValue = Array.from(currentValue);

            if (typeof itemValue === "object" && itemValue != null) {
                itemValue = { ...(currentValue[itemIndex] as object), ...itemValue };
            }

            newListValue[itemIndex] = itemValue ?? "";

            setCurrentValue(newListValue);
            onChange(newListValue);
        },
        [currentValue, onChange],
    );

    const removeItem = useCallback(
        (itemIndex: number) => {
            const newListValue = Array.from(currentValue);

            newListValue.splice(itemIndex, 1);
            setCurrentValue(newListValue);
            onChange(newListValue);
        },
        [currentValue, onChange],
    );

    const addItem = useCallback(() => setCurrentValue((prev) => [...prev, feature.type === "composite" ? {} : ""]), [feature.type]);

    return currentValue.length === 0 ? (
        <div className="flex flex-row flex-wrap gap-2">
            <Button<void> className="btn btn-success col-1" onClick={addItem}>
                +
            </Button>
        </div>
    ) : (
        currentValue.map((itemValue, itemIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: don't have a fixed value type
            <div className="flex flex-row flex-wrap gap-2" key={itemIndex}>
                <Feature
                    feature={feature as FeatureWithSubFeatures}
                    device={{} as Device}
                    deviceState={itemValue as DeviceState}
                    onChange={(value) => onItemChange(value, itemIndex)}
                    featureWrapperClass={FeatureWrapper}
                    parentFeatures={parentFeatures}
                />
                <div className="flex flex-row flex-wrap gap-1">
                    {canRemove && (
                        <Button<number> item={itemIndex} className="btn btn-sm btn-error btn-square join-item" onClick={removeItem}>
                            -
                        </Button>
                    )}
                    {canAdd && (
                        <Button<void> className="btn btn-sm btn-success btn-square join-item" onClick={addItem}>
                            +
                        </Button>
                    )}
                </div>
            </div>
        ))
    );
});

export default ListEditor;
