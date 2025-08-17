import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import store2 from "store2";
import { TABLE_COLUMN_VISIBILITY_KEY } from "../localStoreConsts.js";

export interface UseTableProps<T> {
    id: string;
    columns: ColumnDef<T, unknown>[];
    data: T[];
    visibleColumns?: Record<string, boolean>;
}

export function useTable<T>({ id, columns, data, visibleColumns }: UseTableProps<T>) {
    const columnVisibilityStoreKey = `${TABLE_COLUMN_VISIBILITY_KEY}_${id}`;
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(store2.get(columnVisibilityStoreKey, visibleColumns ?? {}));
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: {
            columnFilters,
            columnVisibility,
            pagination: {
                pageIndex: 0, // custom initial page index
                pageSize: 500, // custom default page size
            },
        },
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // client side filtering
        getSortedRowModel: getSortedRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        // debugTable: false,
        // debugHeaders: false,
        // debugColumns: false,
        // debugCells: false,
        // debugRows: false,
        // debugAll: false,
    });

    useEffect(() => {
        store2.set(columnVisibilityStoreKey, columnVisibility);
    }, [columnVisibilityStoreKey, columnVisibility]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: does not change
    const getFilteredData = useCallback(() => table.getFilteredRowModel().rows.map((row) => row.original), []);

    return { table, getFilteredData };
}
