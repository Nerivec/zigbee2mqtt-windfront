import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type BinaryFeature, FeatureAccessMode } from "../../types.js";
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
    const { t } = useTranslation("zigbee");
    const onButtonClick = useCallback((value: string | boolean) => onChange(property ? { [property]: value } : value), [property, onChange]);
    const onCheckboxChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const checkedValue = e.target.checked ? valueOn : valueOff;

            onChange(property ? { [property]: checkedValue } : checkedValue);
        },
        [valueOn, valueOff, property, onChange],
    );

    if (access & FeatureAccessMode.SET) {
        const valueExists = deviceValue != null;
        const showOnOffButtons = !minimal || (minimal && !valueExists);

        return (
            <div>
                {showOnOffButtons && (
                    <Button<string | boolean> className="btn btn-link" item={valueOff} onClick={onButtonClick}>
                        <DisplayValue value={valueOff} name={name} />
                    </Button>
                )}
                {valueExists ? (
                    <input className="toggle" type="checkbox" checked={deviceValue === valueOn} onChange={onCheckboxChange} />
                ) : (
                    <span title={t(($) => $.unknown)}>
                        <FontAwesomeIcon icon={faQuestion} />
                    </span>
                )}
                {showOnOffButtons && (
                    <Button<string | boolean> className="btn btn-link" item={valueOn} onClick={onButtonClick}>
                        <DisplayValue value={valueOn} name={name} />
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
