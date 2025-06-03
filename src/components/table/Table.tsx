import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import TextFilter from "./TextFilter.js";

interface Props<T> {
    id: string;
    columns: ColumnDef<T, unknown>[];
    data: T[];
    visibleColumns?: Record<string, boolean>;
}

export default function Table<T>(props: Props<T>) {
    const { id, columns, data, visibleColumns } = props;
    const [columnVisibility] = useState<Record<string, boolean>>(visibleColumns ?? {});
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

    return (
        <div className="overflow-x-auto">
            <table id={id} className="table">
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
                    {table.getRowModel().rows.map((row) => (
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
