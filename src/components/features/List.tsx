import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type Device,
    type DeviceState,
    FeatureAccessMode,
    type FeatureWithAnySubFeatures,
    type FeatureWithSubFeatures,
    type ListFeature,
} from "../../types.js";
import Button from "../Button.js";
import BaseViewer from "./BaseViewer.js";
import Feature from "./Feature.js";
import FeatureWrapper from "./FeatureWrapper.js";
import { type BaseFeatureProps, clampList } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type Props = BaseFeatureProps<ListFeature> & {
    parentFeatures: FeatureWithAnySubFeatures[];
};

function isListRoot(parentFeatures: FeatureWithAnySubFeatures[]) {
    if (parentFeatures !== undefined) {
        if (parentFeatures.length === 0) {
            return true;
        }

        if (parentFeatures.length === 1) {
            // When parent is e.g. climate
            const parentType = parentFeatures[0].type;

            return parentType != null && parentType !== "composite" && parentType !== "list";
        }
    }

    return false;
}

const buildDefaultArray = (min: number, type: string) => (min > 0 ? Array(min).fill(type === "composite" ? {} : "") : []);

const List = memo((props: Props) => {
    const { t } = useTranslation("common");
    const { feature, minimal, parentFeatures, onChange, deviceValue } = props;
    const { property, access = FeatureAccessMode.SET, item_type, length_min, length_max } = feature;
    const [currentValue, setCurrentValue] = useState<unknown[]>(buildDefaultArray(length_min ?? 0, item_type.type));
    const [canAdd, setCanAdd] = useState(false);
    const [canRemove, setCanRemove] = useState(false);
    const isRoot = isListRoot(parentFeatures);

    useEffect(() => {
        if (deviceValue) {
            if (Array.isArray(deviceValue)) {
                setCurrentValue(clampList(deviceValue, length_min, length_max, (min) => buildDefaultArray(min, item_type.type)));
            } else if (property && typeof deviceValue === "object") {
                const prop = deviceValue[property];

                if (prop) {
                    setCurrentValue(clampList(prop, length_min, length_max, (min) => buildDefaultArray(min, item_type.type)));
                } else {
                    setCurrentValue(buildDefaultArray(length_min ?? 0, item_type.type));
                }
            } else {
                setCurrentValue(buildDefaultArray(length_min ?? 0, item_type.type));
            }
        } else {
            setCurrentValue(buildDefaultArray(length_min ?? 0, item_type.type));
        }
    }, [deviceValue, property, item_type.type, length_min, length_max]);

    useEffect(() => {
        setCanAdd(length_max !== undefined && length_max > 0 ? currentValue.length < length_max : true);
        setCanRemove(length_min !== undefined && length_min > 0 ? currentValue.length > length_min : true);
    }, [currentValue, length_min, length_max]);

    const onItemChange = useCallback(
        async (itemValue: unknown, itemIndex: number) => {
            const newListValue = Array.from(currentValue);

            if (typeof itemValue === "object" && itemValue != null) {
                itemValue = { ...(currentValue[itemIndex] as object), ...itemValue };
            }

            newListValue[itemIndex] = itemValue ?? "";

            setCurrentValue(newListValue);

            if (!isRoot) {
                await onChange(property ? { [property]: newListValue } : newListValue);
            }
        },
        [currentValue, property, isRoot, onChange],
    );

    const addItem = useCallback(() => setCurrentValue((prev) => [...prev, item_type.type === "composite" ? {} : ""]), [item_type.type]);

    const removeItem = useCallback(
        async (itemIndex: number) => {
            const newListValue = Array.from(currentValue);

            newListValue.splice(itemIndex, 1);
            setCurrentValue(newListValue);

            if (!isRoot) {
                await onChange(property ? { [property]: newListValue } : newListValue);
            }
        },
        [currentValue, property, isRoot, onChange],
    );

    const onRootApply = useCallback(async () => {
        await onChange(property ? { [property]: currentValue } : currentValue);
    }, [property, onChange, currentValue]);

    if (access & FeatureAccessMode.SET) {
        return (
            <>
                {currentValue.map((itemValue, itemIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: don't have a fixed value type
                    <div key={itemIndex} className="flex flex-row flex-wrap gap-2 items-center">
                        <Feature
                            feature={item_type as FeatureWithSubFeatures}
                            device={{} as Device}
                            deviceState={itemValue as DeviceState}
                            onChange={(value) => onItemChange(value, itemIndex)}
                            featureWrapperClass={FeatureWrapper}
                            parentFeatures={[...parentFeatures, feature]}
                        />
                        {canRemove && (
                            <Button<number> item={itemIndex} className="btn btn-sm btn-error btn-square" onClick={removeItem}>
                                -
                            </Button>
                        )}
                    </div>
                ))}
                {canAdd && (
                    <div className="flex flex-row flex-wrap gap-2">
                        <Button<void> className="btn btn-sm btn-success btn-square" onClick={addItem}>
                            +
                        </Button>
                    </div>
                )}
                {isRoot && (
                    <div>
                        <Button className={`btn btn-primary ${minimal ? "btn-sm" : ""}`} onClick={onRootApply}>
                            {t(($) => $.apply)}
                        </Button>
                    </div>
                )}
            </>
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default List;
