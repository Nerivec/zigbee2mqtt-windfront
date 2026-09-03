import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type BinaryFeature, FeatureAccessMode } from "../../types.js";
import { getExposeValueLabel } from "../../utils/exposeTranslations.js";
import Button from "../Button.js";
import DisplayValue from "../value-decorators/DisplayValue.js";
import BaseViewer from "./BaseViewer.js";
import type { BaseFeatureProps } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type BinaryProps = BaseFeatureProps<BinaryFeature>;

const Binary = memo((props: BinaryProps) => {
    const {
        feature: { access = FeatureAccessMode.SET, name, property, value_off: valueOff, value_on: valueOn },
        deviceValue,
        onChange,
        minimal,
    } = props;
    const { t, i18n } = useTranslation("zigbee");
    const locale = i18n.language?.split("-")[0] ?? "en";
    const translations = (props.feature as { translations?: Record<string, { values?: Record<string, string> }> }).translations;
    const onButtonClick = useCallback((value: string | boolean) => onChange(property ? { [property]: value } : value), [property, onChange]);
    const onCheckboxChange = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
            const checkedValue = e.target.checked ? valueOn : valueOff;

            await onChange(property ? { [property]: checkedValue } : checkedValue);
        },
        [valueOn, valueOff, property, onChange],
    );

    if (access & FeatureAccessMode.SET) {
        const valueExists = deviceValue != null;
        const showOnOffButtons = !minimal || (minimal && !valueExists);

        const renderValue = (value: string | boolean) =>
            typeof value === "string" ? getExposeValueLabel(value, translations, locale) : <DisplayValue value={value} name={name} />;

        return (
            <div>
                {showOnOffButtons && (
                    <Button<string | boolean> className="btn btn-link" item={valueOff} onClick={onButtonClick}>
                        {renderValue(valueOff)}
                    </Button>
                )}
                {valueExists ? (
                    <input className="toggle" type="checkbox" checked={deviceValue === valueOn} onChange={onCheckboxChange} />
                ) : (
                    <span className="tooltip" data-tip={t(($) => $.unknown)}>
                        <FontAwesomeIcon icon={faQuestion} />
                    </span>
                )}
                {showOnOffButtons && (
                    <Button<string | boolean> className="btn btn-link" item={valueOn} onClick={onButtonClick}>
                        {renderValue(valueOn)}
                    </Button>
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
