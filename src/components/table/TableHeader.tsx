import type { Column } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { API_NAMES } from "../../store.js";
import type { GlobalFilterProps } from "./GlobalFilter.js";
import SourceExternalFilter from "./SourceExternalFilter.js";

interface TableHeaderProps<T> extends GlobalFilterProps {
    tableId: string;
    columns: Column<T>[];
    entries: number;
}

export default function TableHeader<T>({ tableId, columns, entries /*globalFilter, setGlobalFilter*/ }: TableHeaderProps<T>) {
    const { t } = useTranslation("common");
    let sourceColumn: Column<T> | undefined;

    if (API_NAMES.length > 1) {
        sourceColumn = columns.find((c) => c.id === "source");
    }

    return (
        <>
            {/* <div className="flex flex-row flex-wrap justify-center items-center gap-3 mb-3 text-sm">
                <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div> */}
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
                <div className="ml-auto flex flex-row flex-wrap gap-2">
                    {sourceColumn && <SourceExternalFilter column={sourceColumn} tableId={tableId} />}
                    <span className="label">
                        {t("entries")}: {entries}
                    </span>
                </div>
            </div>
        </>
    );
}
