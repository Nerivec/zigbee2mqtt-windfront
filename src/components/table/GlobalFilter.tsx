import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import DebouncedInput from "../form-fields/DebouncedInput.js";

export interface GlobalFilterProps {
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
}

export default function GlobalFilter({ globalFilter, setGlobalFilter }: GlobalFilterProps) {
    const { t } = useTranslation("common");

    return (
        // biome-ignore lint/a11y/noLabelWithoutControl: wrapped input
        <label className="input input-sm outline-none!">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <DebouncedInput onChange={setGlobalFilter} placeholder={t("search")} value={globalFilter} />
        </label>
    );
}
