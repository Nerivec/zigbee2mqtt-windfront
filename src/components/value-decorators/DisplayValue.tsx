import { memo } from "react";
import { useTranslation } from "react-i18next";

type DisplayValueProps = {
    name: string;
    value: unknown;
};

const BooleanValueView = memo((props: DisplayValueProps) => {
    const { value, name } = props;
    const { t } = useTranslation("values");

    switch (name) {
        case "contact": {
            return value ? t(($) => $.closed) : t(($) => $.open);
        }
        case "occupancy": {
            return value ? t(($) => $.occupied) : t(($) => $.clear);
        }
        case "water_leak": {
            return value ? <span className="text-error animate-pulse">{t(($) => $.leaking)}</span> : t(($) => $.clear);
        }
        case "tamper": {
            return value ? <span className="text-error animate-pulse">{t(($) => $.tampered)}</span> : t(($) => $.clear);
        }
        case "supported": {
            return value ? t(($) => $.supported) : t(($) => $.not_supported);
        }
        default: {
            return value ? t(($) => $.true) : t(($) => $.false);
        }
    }
});

const DisplayValue = memo((props: DisplayValueProps) => {
    const { t } = useTranslation("values");
    const { value } = props;

    switch (typeof value) {
        case "boolean":
            return <BooleanValueView {...props} />;
        case "undefined":
            return "N/A";
        case "object":
            return value === null ? t(($) => $.null) : JSON.stringify(value);
        case "string":
            return value === "" ? <span className="text-xs opacity-50">{t(($) => $.empty_string)}</span> : value;
        default:
            return JSON.stringify(value);
    }
});

export default DisplayValue;
