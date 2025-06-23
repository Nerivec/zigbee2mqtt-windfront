import { memo, useCallback, useEffect, useState } from "react";
import type { BasicFeature, Device, FeatureWithAnySubFeatures, FeatureWithSubFeatures } from "../../types.js";
import Button from "../Button.js";
import Feature from "../features/Feature.js";
import FeatureWrapper from "../features/FeatureWrapper.js";

type ListEditorProps = {
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    value: any[];
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    onChange(value: any[]): void;
    feature: BasicFeature | FeatureWithSubFeatures;
    parentFeatures: FeatureWithAnySubFeatures[];
};

const ListEditor = memo((props: ListEditorProps) => {
    const { onChange, value, feature, parentFeatures } = props;
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const [currentValue, setCurrentValue] = useState<any[]>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const replaceList = useCallback(
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        (newListValue: any[]) => {
            setCurrentValue(newListValue);
            onChange(newListValue);
        },
        [onChange],
    );

    const onItemChange = useCallback(
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        (itemValue: any, itemIndex: number) => {
            const newListValue = Array.from(currentValue);

            if (typeof itemValue === "object") {
                itemValue = { ...currentValue[itemIndex], ...itemValue };
            }

            newListValue[itemIndex] = itemValue;
            replaceList(newListValue);
        },
        [currentValue, replaceList],
    );

    const handleRemoveClick = useCallback(
        (itemIndex: number) => {
            const newListValue = Array.from(currentValue);

            newListValue.splice(itemIndex, 1);
            replaceList(newListValue);
        },
        [currentValue, replaceList],
    );

    const handleAddClick = useCallback(() => setCurrentValue([...currentValue, {}]), [currentValue]);

    return currentValue.length === 0 ? (
        <div className="flex flex-row flex-wrap gap-2">
            <Button<void> className="btn btn-success col-1" onClick={handleAddClick}>
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
                    deviceState={itemValue}
                    onChange={(value) => onItemChange(value, itemIndex)}
                    onRead={(_value) => {}}
                    featureWrapperClass={FeatureWrapper}
                    parentFeatures={parentFeatures}
                />
                <div className="join join-vertical lg:join-horizontal">
                    <Button<number> item={itemIndex} className="btn btn-sm btn-error btn-square join-item" onClick={handleRemoveClick}>
                        -
                    </Button>
                    {currentValue.length - 1 === itemIndex && (
                        <Button<void> className="btn btn-sm btn-success btn-square join-item" onClick={handleAddClick}>
                            +
                        </Button>
                    )}
                </div>
            </div>
        ))
    );
});

export default ListEditor;
