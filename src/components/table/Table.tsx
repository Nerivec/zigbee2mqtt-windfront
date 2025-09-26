import { flexRender, type Row } from "@tanstack/react-table";
import { type TableComponents, TableVirtuoso } from "react-virtuoso";
import type { UseTableProps, useTable } from "../../hooks/useTable.js";
import TableHeader from "./TableHeader.js";

const tableComponents: TableComponents<Row<unknown>, unknown> = {
    Table: ({ style, context, ...props }) => (
        <div className="overflow-x-auto">
            <table
                {...props}
                className="table table-sm mb-3 min-w-full"
                style={{
                    ...style,
                    tableLayout: "fixed",
                }}
            />
        </div>
    ),
    TableHead: ({ context, children, style, ...props }) => <thead {...props}>{children}</thead>,
    TableRow: ({ item, context, ...props }) => (
        <tr {...props}>
            {item.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
        </tr>
    ),
};

interface TableProps<T> extends Pick<UseTableProps<T>, "id">, ReturnType<typeof useTable<T>> {}

export default function Table<T>({ id, table }: TableProps<T>) {
    return (
        <>
            <TableHeader table={table} />

            <TableVirtuoso<Row<T>>
                useWindowScroll
                id={id}
                className="mt-1.5"
                data={table.getRowModel().rows}
                components={tableComponents as TableComponents<Row<T>, unknown>}
                defaultItemHeight={73}
                increaseViewportBy={{ top: 100, bottom: 100 }}
                fixedHeaderContent={() =>
                    table.getHeaderGroups().map((group) => (
                        <tr key={group.id} className="bg-base-200">
                            {group.headers.map((header) => {
                                const sorting = header.column.getIsSorted();
                                const sortingText = sorting === "asc" ? " ↑" : sorting === "desc" ? " ↓" : null;

                                return (
                                    <th key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                {/** biome-ignore lint/a11y/noStaticElementInteractions: special case */}
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? "cursor-pointer select-none whitespace-normal"
                                                            : "whitespace-normal"
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {sortingText}
                                                </div>
                                            </>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))
                }
            />
        </>
    );
}
