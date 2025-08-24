import { faClose, faFilter, faMagnifyingGlass, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { useTable } from "../../hooks/useTable.js";
import Button from "../Button.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";
import TableFiltersDrawer from "./TableFiltersDrawer.js";

export interface TableHeaderProps<T> extends ReturnType<typeof useTable<T>> {
    actions?: ReactNode;
    noColumn?: boolean;
}

export default function TableHeader<T>({ table, resetFilters, globalFilter, columnFilters, actions, noColumn }: TableHeaderProps<T>) {
    const { t } = useTranslation("common");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const activeFiltersCount = useMemo(() => {
        let count = 0;

        for (const cf of columnFilters) {
            if (cf.value != null && cf.value !== "") {
                count++;
            }
        }

        return count;
    }, [columnFilters]);

    const columns = table.getAllLeafColumns();

    return (
        <>
            <div className="flex flex-row flex-wrap justify-center items-center gap-3 mb-3 text-sm">
                <div className="join">
                    <label className="input input-sm outline-none! join-item">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <DebouncedInput onChange={table.setGlobalFilter} placeholder={t("search")} value={globalFilter} />
                    </label>
                    <Button
                        item=""
                        onClick={table.setGlobalFilter}
                        className="btn btn-sm btn-square btn-warning btn-outline join-item"
                        title={t("clear")}
                        disabled={globalFilter == null || globalFilter === ""}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
                <div className="join">
                    <Button<boolean>
                        item={!drawerOpen}
                        onClick={setDrawerOpen}
                        className="btn btn-sm btn-info btn-outline join-item"
                        title={t("advanced_search")}
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        {t("advanced_search")}
                        {activeFiltersCount > 0 ? <span className="badge badge-info badge-xs">{activeFiltersCount}</span> : null}
                    </Button>
                    <Button<void>
                        className="btn btn-sm btn-square btn-warning btn-outline join-item"
                        title={t("reset")}
                        onClick={() => {
                            resetFilters();
                        }}
                        disabled={activeFiltersCount === 0}
                    >
                        <FontAwesomeIcon icon={faRotateLeft} />
                    </Button>
                </div>
                <div className="">
                    <span className="label">
                        {t("entries")}: {table.getRowModel().rows.length}
                    </span>
                </div>
                {actions}
            </div>
            {!noColumn && (
                <div className="flex flex-row flex-wrap gap-2 text-xs px-2">
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
                </div>
            )}
            {drawerOpen && <TableFiltersDrawer columns={columns} resetFilters={resetFilters} onClose={() => setDrawerOpen(false)} />}
        </>
    );
}
