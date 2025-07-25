import { faEraser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Column } from "@tanstack/react-table";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import Button from "../Button.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";

type TextFilterProps<T> = {
    getFilterValue: Column<T, unknown>["getFilterValue"];
    setFilterValue: Column<T, unknown>["setFilterValue"];
    storeKey: string;
};

export default function TextFilter<T>({ getFilterValue, setFilterValue, storeKey }: TextFilterProps<T>) {
    const columnFilterValue = getFilterValue();
    const { t } = useTranslation("common");

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        if (!columnFilterValue) {
            const storeValue = store2.get(storeKey, "");

            if (storeValue) {
                setFilterValue(storeValue);
            }
        }
    }, []);

    const onChange = useCallback(
        (value: string) => {
            store2.set(storeKey, value);
            setFilterValue(value);
        },
        [storeKey, setFilterValue],
    );

    return (
        <div className="join">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
            <label className="input input-xs w-32 join-item">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <DebouncedInput
                    className=""
                    type="search"
                    onChange={onChange}
                    placeholder={t("search")}
                    value={(columnFilterValue as string) ?? ""}
                />
            </label>
            <Button item="" onClick={onChange} className="btn btn-xs btn-square join-item" title={t("clear")}>
                <FontAwesomeIcon icon={faEraser} />
            </Button>
        </div>
    );
}
