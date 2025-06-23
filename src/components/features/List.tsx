import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeatureAccessMode, type FeatureWithAnySubFeatures, type ListFeature } from "../../types.js";
import Button from "../Button.js";
import ListEditor from "../editors/ListEditor.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

interface State {
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    value: any[];
}

type Props = BaseFeatureProps<ListFeature> & {
    parentFeatures: FeatureWithAnySubFeatures[];
};

const List = memo((props: Props) => {
    const { feature, minimal, parentFeatures, onChange, deviceValue } = props;
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const [state, setState] = useState<State>({ value: feature.property ? ((deviceValue?.[feature.property] as any[]) ?? []) : [] });
    const { t } = useTranslation(["list", "common"]);
    const isRoot = useMemo(() => {
        if (parentFeatures !== undefined) {
            if (parentFeatures.length === 1) {
                return true;
            }

            if (parentFeatures.length === 2) {
                // When parent is e.g. climate
                const type = parentFeatures[1].type;

                return type != null && type !== "composite" && type !== "list";
            }
        }

        return false;
    }, [parentFeatures]);

    const onEditorChange = useCallback(
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        (value: any[]): void => {
            setState({ value });

            if (!isRoot) {
                onChange(feature.property ? { [feature.property]: value } : value);
            }
        },
        [feature.property, onChange, isRoot],
    );

    const onRootApply = useCallback(() => {
        onChange(feature.property ? { [feature.property]: state.value } : state.value);
    }, [feature.property, onChange, state.value]);

    const { access = FeatureAccessMode.SET, item_type: itemType } = feature;

    if (access & FeatureAccessMode.SET) {
        return (
            <>
                <ListEditor feature={itemType} parentFeatures={[...parentFeatures, feature]} onChange={onEditorChange} value={state.value} />
                {isRoot && (
                    <div>
                        <Button className={`btn btn-primary ${minimal ? "btn-sm" : ""}`} onClick={onRootApply} disabled={state.value.length === 0}>
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
