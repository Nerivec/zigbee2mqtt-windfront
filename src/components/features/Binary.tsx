import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type BinaryFeature, FeatureAccessMode } from "../../types.js";
import Button from "../Button.js";
import { useCommandFeedback } from "../editors/useCommandFeedback.js";
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
        batched,
        sourceIdx,
    } = props;
    const { t } = useTranslation("zigbee");

    // Track selected value for optimistic UI updates
    const [selectedValue, setSelectedValue] = useState<string | boolean | null>(
        deviceValue === valueOn ? valueOn : deviceValue === valueOff ? valueOff : null,
    );

    const { send } = useCommandFeedback({ sourceIdx, batched });

    // Sync selected value from device state whenever it changes.
    // Value (device truth) and status dot are decoupled:
    // - Value: always shows device state when available
    // - Dot: shows command status (pending/ok/error) independently
    // User's optimistic choice is shown until device state arrives.
    useEffect(() => {
        setSelectedValue(deviceValue === valueOn ? valueOn : deviceValue === valueOff ? valueOff : null);
    }, [deviceValue, valueOn, valueOff]);

    const onButtonClick = useCallback(
        (value: string | boolean) => {
            setSelectedValue(value);
            send((txId) => onChange(property ? { [property]: value } : value, txId));
        },
        [property, onChange, send],
    );

    const onCheckboxChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const checkedValue = e.target.checked ? valueOn : valueOff;
            setSelectedValue(checkedValue);
            send((txId) => onChange(property ? { [property]: checkedValue } : checkedValue, txId));
        },
        [valueOn, valueOff, property, onChange, send],
    );

    if (access & FeatureAccessMode.SET) {
        const valueExists = deviceValue != null;
        const showOnOffButtons = !minimal || (minimal && !valueExists);

        return (
            <div className="flex flex-row items-center gap-2">
                {showOnOffButtons && (
                    <Button<string | boolean> className="btn btn-link p-0 min-h-0 h-auto" item={valueOff} onClick={onButtonClick}>
                        <DisplayValue value={valueOff} name={name} />
                    </Button>
                )}
                {valueExists ? (
                    <input className="toggle" type="checkbox" checked={selectedValue === valueOn} onChange={onCheckboxChange} />
                ) : (
                    <span className="tooltip" data-tip={t(($) => $.unknown)}>
                        <FontAwesomeIcon icon={faQuestion} />
                    </span>
                )}
                {showOnOffButtons && (
                    <Button<string | boolean> className="btn btn-link p-0 min-h-0 h-auto" item={valueOn} onClick={onButtonClick}>
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
