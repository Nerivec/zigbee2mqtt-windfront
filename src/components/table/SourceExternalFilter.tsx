import type { Column } from "@tanstack/react-table";
import { type ChangeEvent, useCallback, useEffect } from "react";
import store2 from "store2";
import { TABLE_COLUMN_FILTER_KEY } from "../../localStoreConsts.js";
import SourceSwitcher from "../SourceSwitcher.js";

interface SourceExternalFilter<T> {
    column: Column<T>;
    tableId: string;
}

export default function SourceExternalFilter<T>({ column, tableId }: SourceExternalFilter<T>) {
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

    return <SourceSwitcher currentValue={columnFilterValue} onChange={onChange} className="select-sm" />;
}
