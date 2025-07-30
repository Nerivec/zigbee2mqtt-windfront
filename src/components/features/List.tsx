import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeatureAccessMode, type FeatureWithAnySubFeatures, type ListFeature } from "../../types.js";
import Button from "../Button.js";
import ListEditor from "../editors/ListEditor.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type Props = BaseFeatureProps<ListFeature> & {
    parentFeatures: FeatureWithAnySubFeatures[];
};

const List = memo((props: Props) => {
    const { t } = useTranslation(["list", "common"]);
    const { feature, minimal, parentFeatures, onChange, deviceValue } = props;
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const [currentValue, setCurrentValue] = useState(feature.property ? ((deviceValue?.[feature.property] as any[]) ?? []) : []);
    const isRoot = useMemo(() => {
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
    }, [parentFeatures]);

    const onEditorChange = useCallback(
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        (value: any[]): void => {
            setCurrentValue(value);

            if (!isRoot) {
                onChange(feature.property ? { [feature.property]: value } : value);
            }
        },
        [feature.property, onChange, isRoot],
    );

    const onRootApply = useCallback(() => {
        onChange(feature.property ? { [feature.property]: currentValue } : currentValue);
    }, [feature.property, onChange, currentValue]);

    const { access = FeatureAccessMode.SET, item_type: itemType } = feature;

    if (access & FeatureAccessMode.SET) {
        return (
            <>
                <ListEditor feature={itemType} parentFeatures={[...parentFeatures, feature]} onChange={onEditorChange} value={currentValue} />
                {isRoot && (
                    <div>
                        <Button className={`btn btn-primary ${minimal ? "btn-sm" : ""}`} onClick={onRootApply} disabled={currentValue.length === 0}>
                            {t("common:apply")}
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
