import type { Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

export interface TableHeaderProps<T> {
    table: Table<T>;
}

export default function TableHeader<T>({ table }: TableHeaderProps<T>) {
    const { t } = useTranslation("common");

    return (
        <div className="flex flex-row flex-wrap gap-2 text-xs px-2">
            <span className="label">{t(($) => $.columns)}: </span>
            {table.getAllLeafColumns().map((column) =>
                column.id === "select" ? null : (
                    <label key={column.id} className="label">
                        <input
                            checked={column.getIsVisible()}
                            disabled={!column.getCanHide()}
                            onChange={column.getToggleVisibilityHandler()}
                            type="checkbox"
                            className="checkbox checkbox-xs"
                        />
                        {typeof column.columnDef.header === "string" && column.columnDef.header ? column.columnDef.header : t(($) => $[column.id])}
                    </label>
                ),
            )}
        </div>
    );
}
