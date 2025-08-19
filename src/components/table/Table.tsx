import { type Column, flexRender, type HeaderGroup, type Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll.js";
import type { UseTableProps, useTable } from "../../hooks/useTable.js";
import { TABLE_COLUMN_FILTER_KEY } from "../../localStoreConsts.js";
import TextFilter from "./TextFilter.js";

interface Props<T> extends Pick<UseTableProps<T>, "id"> {
    table: ReturnType<typeof useTable<T>>["table"];
}

interface TableBodyRowProps<T> {
    row: Row<T>;
}

function TableBodyRow<T>({ row }: TableBodyRowProps<T>) {
    return (
        <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
        </tr>
    );
}

interface TableBodyProps<T> {
    rows: Row<T>[];
}

function TableBody<T>({ rows }: TableBodyProps<T>) {
    return (
        <tbody>
            {rows.map((row) => (
                <TableBodyRow key={row.id} row={row} />
            ))}
        </tbody>
    );
}

interface TableHeadRowProps<T> {
    tableId: string;
    group: HeaderGroup<T>;
}

function TableHeadRow<T>({ tableId, group }: TableHeadRowProps<T>) {
    return (
        <tr key={group.id}>
            {group.headers.map((header) => {
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
                                            storeKey={`${TABLE_COLUMN_FILTER_KEY}_${tableId}_${header.column.id}`}
                                        />
                                    </div>
                                ) : null}
                            </>
                        )}
                    </th>
                );
            })}
        </tr>
    );
}

interface TableHeadProps<T> {
    tableId: string;
    groups: HeaderGroup<T>[];
}

function TableHead<T>({ tableId, groups }: TableHeadProps<T>) {
    return (
        <thead>
            {groups.map((group) => (
                <TableHeadRow key={group.id} tableId={tableId} group={group} />
            ))}
        </thead>
    );
}

interface TableHeaderProps<T> {
    columns: Column<T>[];
    entries: number;
}

function TableHeader<T>({ columns, entries }: TableHeaderProps<T>) {
    const { t } = useTranslation("common");

    return (
        <div className="flex flex-row flex-wrap gap-2 text-xs px-3">
            <span className="label">{t("columns")}: </span>
            {columns.map((column) =>
                column.id === "select" ? null : (
                    <label key={column.id} className="label">
                        <input
                            checked={column.getIsVisible()}
                            disabled={!column.getCanHide()}
                            onChange={column.getToggleVisibilityHandler()}
                            type="checkbox"
                            className="checkbox checkbox-xs"
                        />
                        {typeof column.columnDef.header === "string" && column.columnDef.header ? column.columnDef.header : t(column.id)}
                    </label>
                ),
            )}
            <span className="ml-auto label">
                {t("entries")}: {entries}
            </span>
        </div>
    );
}

export default function Table<T>({ id, table }: Props<T>) {
    const { rows } = table.getRowModel();
    const { sentinelRef, renderItems } = useInfiniteScroll(rows, 16);

    return (
        <div className="overflow-x-auto" style={{ overflowAnchor: "auto", scrollbarGutter: "stable both-edges" }}>
            <TableHeader columns={table.getAllColumns()} entries={rows.length} />
            <table id={id} className="table table-sm mb-3">
                <TableHead tableId={id} groups={table.getHeaderGroups()} />
                <TableBody rows={renderItems} />
            </table>
            <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, width: "100%", overflowAnchor: "none" }} />
        </div>
    );
}
