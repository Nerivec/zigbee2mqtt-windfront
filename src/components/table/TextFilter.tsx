import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Column } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import DebouncedInput from "../form-fields/DebouncedInput.js";

export default function TextFilter<T>({
    getFilterValue,
    setFilterValue,
}: {
    getFilterValue: Column<T, unknown>["getFilterValue"];
    setFilterValue: Column<T, unknown>["setFilterValue"];
}) {
    const columnFilterValue = getFilterValue();
    const { t } = useTranslation("common");

    return (
        // biome-ignore lint/a11y/noLabelWithoutControl: wrapped input
        <label className="input input-xs w-32">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <DebouncedInput
                className=""
                type="search"
                onChange={setFilterValue}
                placeholder={t("search")}
                value={(columnFilterValue as string) ?? ""}
            />
        </label>
    );
}
