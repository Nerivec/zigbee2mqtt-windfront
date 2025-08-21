import { type ChangeEventHandler, memo } from "react";
import { useTranslation } from "react-i18next";
import { API_NAMES } from "../store.js";

interface SourceSwitcherProps {
    currentValue?: string;
    onChange: ChangeEventHandler<HTMLSelectElement>;
    className?: string;
}
const SourceSwitcher = memo(({ currentValue, onChange, className }: SourceSwitcherProps) => {
    const { t } = useTranslation("common");

    return (
        <select className={`${className} select w-auto`} value={currentValue ?? ""} onChange={onChange}>
            <option value="">{t("all_sources")}</option>
            {API_NAMES.map((name, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static indexes
                <option key={`${name}-${idx}`} value={`${idx} ${name}`}>
                    {name}
                </option>
            ))}
        </select>
    );
});

export default SourceSwitcher;
