import { flexRender } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import type { UseTableProps, useTable } from "../../hooks/useTable.js";
import { TABLE_COLUMN_FILTER_KEY } from "../../localStoreConsts.js";
import TextFilter from "./TextFilter.js";

interface Props<T> extends Pick<UseTableProps<T>, "id"> {
    table: ReturnType<typeof useTable<T>>["table"];
}

export default function Table<T>({ id, table }: Props<T>) {
    const { t } = useTranslation("common");
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
                            {typeof column.columnDef.header === "string" && column.columnDef.header ? column.columnDef.header : t(column.id)}
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
                                                            storeKey={`${TABLE_COLUMN_FILTER_KEY}_${id}_${header.column.id}`}
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
