import { faClose, faFilter, faMagnifyingGlass, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { t } from "i18next";
import { type ReactNode, useMemo, useState } from "react";
import type { useTable } from "../../hooks/useTable.js";
import Button from "../Button.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";
import TableFiltersDrawer from "./TableFiltersDrawer.js";

export interface TableSearchProps<T> extends ReturnType<typeof useTable<T>> {
    actions?: ReactNode;
}

export default function TableSearch<T>({ table, resetFilters, globalFilter, columnFilters, actions }: TableSearchProps<T>) {
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

    return (
        <div className="flex flex-row flex-wrap flex-1 items-center gap-x-3 gap-y-2 text-sm">
            <div className="join">
                <label className="input input-sm lg:input-md join-item">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <DebouncedInput onChange={table.setGlobalFilter} placeholder={t(($) => $.search)} value={globalFilter} />
                </label>
                <Button
                    item=""
                    onClick={table.setGlobalFilter}
                    className="btn btn-sm lg:btn-md btn-square btn-warning btn-outline join-item tooltip-bottom"
                    title={t(($) => $.clear)}
                    disabled={globalFilter == null || globalFilter === ""}
                >
                    <FontAwesomeIcon icon={faClose} />
                </Button>
            </div>
            <div className="drawer drawer-end w-auto">
                <input id="table-filters-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <div className="join">
                        <label
                            htmlFor="table-filters-drawer"
                            className="drawer-button btn btn-sm lg:btn-md btn-info btn-outline join-item tooltip tooltip-bottom"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            data-tip={t(($) => $.advanced_search)}
                        >
                            <FontAwesomeIcon icon={faFilter} />
                            {t(($) => $.advanced_search)}
                            {activeFiltersCount > 0 ? <span className="badge badge-info badge-xs lg:badge-sm">{activeFiltersCount}</span> : null}
                        </label>
                        <Button<void>
                            className="btn btn-sm lg:btn-md btn-square btn-warning btn-outline join-item tooltip-bottom"
                            title={t(($) => $.reset)}
                            onClick={() => {
                                resetFilters();
                            }}
                            disabled={activeFiltersCount === 0}
                        >
                            <FontAwesomeIcon icon={faRotateLeft} />
                        </Button>
                    </div>
                </div>
                <div className="drawer-side">
                    <label
                        htmlFor="table-filters-drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <aside className="bg-base-100 min-h-screen w-80">
                        {drawerOpen && <TableFiltersDrawer columns={table.getAllLeafColumns()} resetFilters={resetFilters} />}
                    </aside>
                </div>
            </div>
            <div className="">
                <span className="label">
                    {t(($) => $.entries)}: {table.getRowModel().rows.length}
                </span>
            </div>
            {actions}
        </div>
    );
}
