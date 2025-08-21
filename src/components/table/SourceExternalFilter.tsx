import type { Column } from "@tanstack/react-table";
import { type ChangeEvent, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { TABLE_COLUMN_FILTER_KEY } from "../../localStoreConsts.js";
import { API_NAMES } from "../../store.js";

interface SourceExternalFilter<T> {
    column: Column<T>;
    tableId: string;
}

export default function SourceExternalFilter<T>({ column, tableId }: SourceExternalFilter<T>) {
    const { t } = useTranslation("common");
    const storeKey = `${TABLE_COLUMN_FILTER_KEY}_${tableId}_${column.id}`;
    const columnFilterValue = column.getFilterValue() as string;

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        if (!columnFilterValue) {
            const storeValue = store2.get(storeKey, "");

            if (storeValue) {
                column.setFilterValue(storeValue);
            }
        }
    }, []);

    const onChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            store2.set(storeKey, event.target.value);
            column.setFilterValue(event.target.value);
        },
        [storeKey, column.setFilterValue],
    );

    return (
        <div className="flex flex-row gap-2 items-center">
            {t("show_only")}
            <select className="select select-sm" value={columnFilterValue ?? ""} onChange={onChange}>
                <option value="">All</option>
                {API_NAMES.map((name, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static indexes
                    <option key={`${name}-${idx}`} value={`${idx} ${name}`}>
                        {name}
                    </option>
                ))}
            </select>
        </div>
    );
}
