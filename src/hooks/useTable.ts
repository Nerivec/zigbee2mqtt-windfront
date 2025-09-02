import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    type OnChangeFn,
    type RowData,
    type RowSelectionState,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import store2 from "store2";
import { TABLE_COLUMNS_KEY, TABLE_FILTERS_KEY, TABLE_SORTING_KEY } from "../localStoreConsts.js";

declare module "@tanstack/react-table" {
    // allows us to define custom properties for our columns
    // biome-ignore lint/correctness/noUnusedVariables: API
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: "text" | "range" | "select" | "boolean" | "arrSelect";
        textFaceted?: boolean;
        /** applies to select and text */
        maxFacetOptions?: number;
        showFacetedOccurrences?: boolean;
        tooltip?: string;
    }
}

export interface UseTableProps<T> {
    id: string;
    columns: ColumnDef<T, unknown>[];
    data: T[];
    visibleColumns?: Record<string, boolean>;
    sorting?: SortingState;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export function useTable<T>({ id, columns, data, visibleColumns, sorting, rowSelection, onRowSelectionChange }: UseTableProps<T>) {
    const columnVisibilityStoreKey = `${TABLE_COLUMNS_KEY}_${id}`;
    const tableSortingStoreKey = `${TABLE_SORTING_KEY}_${id}`;
    const globalFilterStoreKey = `${TABLE_FILTERS_KEY}_${id}_global`;
    const columnFiltersStoreKey = `${TABLE_FILTERS_KEY}_${id}_columns`;

    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(store2.get(columnVisibilityStoreKey, visibleColumns ?? {}));

    useEffect(() => {
        store2.set(columnVisibilityStoreKey, columnVisibility);
    }, [columnVisibilityStoreKey, columnVisibility]);

    const [tableSorting, setTableSorting] = useState<SortingState>(store2.get(tableSortingStoreKey, sorting ?? []));

    useEffect(() => {
        store2.set(tableSortingStoreKey, tableSorting);
    }, [tableSortingStoreKey, tableSorting]);

    const [globalFilter, setGlobalFilter] = useState<string>(store2.get(globalFilterStoreKey, ""));

    useEffect(() => {
        store2.set(globalFilterStoreKey, globalFilter);
    }, [globalFilterStoreKey, globalFilter]);

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(store2.get(columnFiltersStoreKey, []));

    useEffect(() => {
        store2.set(columnFiltersStoreKey, columnFilters);
    }, [columnFiltersStoreKey, columnFilters]);

    const resetFilters = useCallback(() => {
        setGlobalFilter("");
        setColumnFilters([]);
    }, []);

    const table = useReactTable({
        data,
        columns,
        // filterFns: {},
        state: {
            globalFilter,
            columnFilters,
            columnVisibility,
            rowSelection,
            sorting: tableSorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // client side filtering
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        onSortingChange: setTableSorting,
        onRowSelectionChange,
        enableRowSelection: !!onRowSelectionChange,
        // debugTable: true,
        // debugHeaders: true,
        // debugColumns: true,
        // debugCells: true,
        // debugRows: true,
        // debugAll: true,
    });

    return { table, resetFilters, globalFilter, columnFilters };
}
