import NiceModal from "@ebay/nice-modal-react";
import { faClose, faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type PropsWithChildren, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";
import { SearchModal } from "../modal/components/SearchModal.js";

export interface GlobalFilterProps extends PropsWithChildren {
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
}

export default function GlobalFilter({ children, globalFilter, setGlobalFilter }: GlobalFilterProps) {
    const { t } = useTranslation("common");

    const onFiltersClick = useCallback(async (): Promise<void> => {
        await NiceModal.show(SearchModal, {
            children,
            search: () => {},
        });
    }, [children]);

    return (
        <div className="join">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
            <label className="input input-sm outline-none! join-item">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <DebouncedInput onChange={setGlobalFilter} placeholder={t("search")} value={globalFilter} />
                {/* <FontAwesomeIcon icon={faFilter} className="opacity-50 cursor-pointer" onClick={onFiltersClick} /> */}
            </label>
            <Button onClick={onFiltersClick} className="btn btn-sm btn-square join-item" title={t("filter")}>
                <FontAwesomeIcon icon={faFilter} />
            </Button>
            <Button
                item=""
                onClick={setGlobalFilter}
                className="btn btn-sm btn-square join-item"
                title={t("clear")}
                disabled={globalFilter == null || globalFilter === ""}
            >
                <FontAwesomeIcon icon={faClose} />
            </Button>
        </div>
    );
}
