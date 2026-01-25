import { memo } from "react";
import { FeatureAccessMode, type TextFeature } from "../../types.js";
import TextEditor from "../editors/TextEditor.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

interface TextProps extends BaseFeatureProps<TextFeature> {
    hasLocalChange?: boolean;
}

const Text = memo((props: TextProps) => {
    const {
        feature: { access = FeatureAccessMode.SET, property },
        deviceValue,
        onChange,
        minimal,
        batched,
        hasLocalChange,
        sourceIdx,
    } = props;

    if (access & FeatureAccessMode.SET) {
        return (
            <TextEditor
                onChange={(value, transactionId) => onChange(property ? { [property]: value } : value, transactionId)}
                value={deviceValue != null ? (typeof deviceValue === "string" ? deviceValue : JSON.stringify(deviceValue)) : ""}
                minimal={minimal}
                batched={batched}
                hasLocalChange={hasLocalChange}
                sourceIdx={sourceIdx}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default Text;
