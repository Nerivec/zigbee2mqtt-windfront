import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { TABLE_COLUMN_FILTER } from "../../localStoreConsts.js";
import TextFilter from "./TextFilter.js";

interface Props<T> {
    id: string;
    columns: ColumnDef<T, unknown>[];
    data: T[];
    visibleColumns?: Record<string, boolean>;
}

export default function Table<T>(props: Props<T>) {
    const { t } = useTranslation("common");
    const { id, columns, data, visibleColumns } = props;
    const columnVisibilityStoreKey = `${id}-column-visibility`;
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

    const rows = table.getRowModel().rows;

    return (
        <div className="overflow-x-auto">
            <div className="flex flex-row flex-wrap gap-2 text-xs px-3">
                <span className="label">{t("columns")}: </span>
                {table.getAllColumns().map((column) =>
                    column.id === "select" ? null : (
                        <label key={column.id} className="label">
                            <input
                                checked={column.getIsVisible()}
                                disabled={!column.getCanHide()}
                                onChange={column.getToggleVisibilityHandler()}
                                type="checkbox"
                                className="checkbox checkbox-xs"
                            />
                            {typeof column.columnDef.header === "string" && column.columnDef.header ? column.columnDef.header : column.id}
                        </label>
                    ),
                )}
                <span className="ml-auto label">
                    {t("entries")}: {rows.length}
                </span>
            </div>
            <table id={id} className="table table-sm mb-3">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const sorting = header.column.getIsSorted();
                                const sortingText = sorting === "asc" ? " ↑" : sorting === "desc" ? " ↓" : null;

                                return (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                {/** biome-ignore lint/a11y/noStaticElementInteractions: special case */}
                                                <div
                                                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {sortingText}
                                                </div>
                                                {header.column.getCanFilter() ? (
                                                    <div className="mt-1">
                                                        <TextFilter
                                                            getFilterValue={header.column.getFilterValue}
                                                            setFilterValue={header.column.setFilterValue}
                                                            storeKey={`${TABLE_COLUMN_FILTER}_${id}_${header.column.id}`}
                                                        />
                                                    </div>
                                                ) : null}
                                            </>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-base-300">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
