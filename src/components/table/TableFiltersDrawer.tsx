import { faFilter, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Column } from "@tanstack/react-table";
import { Fragment, type JSX } from "react";
import { useTranslation } from "react-i18next";
import type { useTable } from "../../hooks/useTable.js";
import { MULTI_INSTANCE } from "../../store.js";
import Button from "../Button.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";

interface FilterProps<T> {
    column: Column<T>;
    label: string;
}

function RangeFilter<T>({ column, label }: FilterProps<T>) {
    const value = column.getFilterValue() as [number, number] | undefined;
    const minMax = column.getFacetedMinMaxValues();
    const min = minMax?.[0];
    const max = minMax?.[1];
    const vMin = Number.isNaN(Number(value?.[0])) ? undefined : value?.[0];
    const vMax = Number.isNaN(Number(value?.[1])) ? undefined : value?.[1];

    return (
        <>
            <label className="label text-xs">{label}</label>
            <div className="flex flex-row gap-2 w-full">
                <input
                    type="number"
                    className="input input-sm w-full"
                    value={vMin ?? ""}
                    placeholder={min !== undefined ? String(min) : "Min"}
                    min={min !== undefined ? Math.round(Number(min)) : undefined}
                    max={vMax ?? (max !== undefined ? Math.round(Number(max)) : undefined)}
                    onChange={(event) => {
                        column.setFilterValue((old: [number, number]) => {
                            const newMin = Number.parseInt(event.target.value, 10);

                            return [Number.isNaN(newMin) ? undefined : newMin, old?.[1]];
                        });
                    }}
                />
                <input
                    type="number"
                    className="input input-sm w-full"
                    value={vMax ?? ""}
                    placeholder={max !== undefined ? String(max) : "Max"}
                    min={vMin ?? (min !== undefined ? Math.round(Number(min)) : undefined)}
                    max={max !== undefined ? Math.round(Number(max)) : undefined}
                    onChange={(event) => {
                        column.setFilterValue((old: [number, number]) => {
                            const newMax = Number.parseInt(event.target.value, 10);

                            return [old?.[0], Number.isNaN(newMax) ? undefined : newMax];
                        });
                    }}
                />
            </div>
        </>
    );
}

function ArrSelectFilter<T>({ column, label }: FilterProps<T>) {
    const { t } = useTranslation("common");
    const meta = column.columnDef.meta ?? {};
    const rawValue = column.getFilterValue();
    const normValue = rawValue && (typeof rawValue === "string" || typeof rawValue === "number") ? rawValue : undefined;
    const values: JSX.Element[] = [];
    // prevent dupe keys (getFacetedUniqueValues doesn't work well with arrays since it appears to just match eq)
    const added = new Set<string>();
    const facetedUniqueValues = column.getFacetedUniqueValues();

    // bypass in case not containing arrays
    if (Array.isArray(facetedUniqueValues.keys().next().value)) {
        for (const [val, occurrences] of column.getFacetedUniqueValues()) {
            if (val != null) {
                for (const entry of val) {
                    if (entry == null || added.has(entry)) {
                        continue;
                    }

                    values.push(
                        <option key={entry} value={entry}>
                            {meta.showFacetedOccurrences ? `${entry} (${occurrences})` : entry}
                        </option>,
                    );
                    added.add(entry);

                    if (meta.maxFacetOptions && values.length >= meta.maxFacetOptions) {
                        break;
                    }
                }
            }
        }

        values.sort((elA, elB) => elA.key!.localeCompare(elB.key!));
    }

    return (
        <>
            <label htmlFor={label} className="label text-xs">
                {label}
            </label>
            <select
                id={label}
                className="select select-sm w-full"
                value={normValue ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            >
                <option value="">{t("all")}</option>
                {values}
            </select>
        </>
    );
}

function SelectFilter<T>({ column, label }: FilterProps<T>) {
    const { t } = useTranslation("common");

    if (!MULTI_INSTANCE && column.id === "source") {
        return null;
    }

    const meta = column.columnDef.meta ?? {};
    const rawValue = column.getFilterValue();
    const normValue = rawValue && (typeof rawValue === "string" || typeof rawValue === "number") ? rawValue : undefined;
    const values: JSX.Element[] = [];

    for (const [val, occurrences] of column.getFacetedUniqueValues()) {
        if (val != null) {
            values.push(
                <option key={val} value={val}>
                    {meta.showFacetedOccurrences ? `${val} (${occurrences})` : val}
                </option>,
            );

            if (meta.maxFacetOptions && values.length >= meta.maxFacetOptions) {
                break;
            }
        }
    }

    values.sort((elA, elB) => elA.key!.localeCompare(elB.key!));

    return (
        <>
            <label htmlFor={label} className="label text-xs">
                {label}
            </label>
            <select
                id={label}
                className="select select-sm w-full"
                value={normValue ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            >
                <option value="">{t("all")}</option>
                {values}
            </select>
        </>
    );
}

function TextFilter<T>({ column, label }: FilterProps<T>) {
    const meta = column.columnDef.meta ?? {};
    const value = column.getFilterValue() as string | undefined;
    const listId = `${column.id}-list`;
    const datalistValues: JSX.Element[] = [];

    if (meta.textFaceted) {
        for (const [val, occurrences] of column.getFacetedUniqueValues()) {
            if (val != null) {
                datalistValues.push(
                    <option key={val} value={val}>
                        {meta.showFacetedOccurrences ? `${val} (${occurrences})` : val}
                    </option>,
                );

                if (meta.maxFacetOptions && datalistValues.length >= meta.maxFacetOptions) {
                    break;
                }
            }
        }

        datalistValues.sort((elA, elB) => elA.key!.localeCompare(elB.key!));
    }

    return (
        <>
            {datalistValues.length > 0 ? <datalist id={listId}>{datalistValues}</datalist> : null}
            <label className="label text-xs">{label}</label>
            <DebouncedInput
                className="input input-sm w-full"
                value={value ?? ""}
                onChange={(v) => column.setFilterValue(v || undefined)}
                list={datalistValues.length > 0 ? listId : undefined}
            />
        </>
    );
}

function BooleanFilter<T>({ column, label }: FilterProps<T>) {
    return (
        <>
            <label className="label text-xs">{label}</label>
            <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={Boolean(column.getFilterValue())}
                onChange={(event) => column.setFilterValue(event.target.checked ? true : undefined)}
            />
        </>
    );
}

interface TableFiltersDrawerProps<T> extends Pick<ReturnType<typeof useTable<T>>, "resetFilters"> {
    columns: Column<T>[];
}

export default function TableFiltersDrawer<T>({ columns, resetFilters }: TableFiltersDrawerProps<T>): JSX.Element {
    const { t } = useTranslation("common");

    return (
        <>
            <div className="flex items-center gap-2 p-2">
                <FontAwesomeIcon icon={faFilter} />
                <span className="font-semibold text-md">{t("advanced_search")}</span>
            </div>
            <div className="flex flex-col gap-2 px-2 pb-2 w-full">
                {columns.map((col) => {
                    const meta = col.columnDef.meta;

                    if (!meta || !meta.filterVariant) {
                        return null;
                    }

                    const label = typeof col.columnDef.header === "string" && col.columnDef.header ? col.columnDef.header : t(col.id);

                    return (
                        <Fragment key={col.id}>
                            <div className="flex flex-row w-full gap-2">
                                {meta.filterVariant === "range" ? (
                                    <RangeFilter column={col} label={label} />
                                ) : meta.filterVariant === "select" ? (
                                    <SelectFilter column={col} label={label} />
                                ) : meta.filterVariant === "boolean" ? (
                                    <BooleanFilter column={col} label={label} />
                                ) : meta.filterVariant === "arrSelect" ? (
                                    <ArrSelectFilter column={col} label={label} />
                                ) : (
                                    <TextFilter column={col} label={label} />
                                )}
                            </div>
                            {meta.tooltip && <p className="label text-xs ml-auto">{meta.tooltip}</p>}
                        </Fragment>
                    );
                })}
            </div>
            <div className="flex flex-row justify-end gap-2 p-3">
                <Button className="btn btn-sm btn-warning btn-outline mt-5" onClick={resetFilters}>
                    <FontAwesomeIcon icon={faRotateLeft} />
                    {t("reset")}
                </Button>
            </div>
        </>
    );
}
