import { memo } from "react";
import { FeatureAccessMode, type TextFeature } from "../../types.js";
import TextEditor from "../editors/TextEditor.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type TextProps = BaseFeatureProps<TextFeature>;

const Text = memo((props: TextProps) => {
    const {
        feature: { access = FeatureAccessMode.SET, property },
        deviceValue,
        onChange,
    } = props;

    if (access & FeatureAccessMode.SET) {
        return <TextEditor onChange={(value) => onChange({ [property]: value })} value={(deviceValue as string) ?? ""} />;
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default Text;
