import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useSearch } from "../../hooks/useSearch.js";
import type { TabName } from "../../pages/GroupPage.js";
import { API_URLS, useAppStore } from "../../store.js";
import type { Group } from "../../types.js";
import DialogDropdown from "../DialogDropdown.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";
import SourceDot from "../SourceDot.js";

interface HeaderGroupSelectorProps {
    currentSourceIdx: number | undefined;
    currentGroup: Group | undefined;
    tab?: TabName;
}

const HeaderGroupSelector = memo(({ currentSourceIdx, currentGroup, tab = "devices" }: HeaderGroupSelectorProps) => {
    const [searchTerm, normalizedSearchTerm, setSearchTerm] = useSearch();
    const { t } = useTranslation("common");
    const groups = useAppStore((state) => state.groups);

    const items = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const group of groups[sourceIdx]) {
                if (sourceIdx === currentSourceIdx && group.id === currentGroup?.id) {
                    continue;
                }

                if (normalizedSearchTerm.length > 0 && !group.friendly_name.toLowerCase().includes(normalizedSearchTerm)) {
                    continue;
                }

                elements.push(
                    <li key={`${group.friendly_name}-${group.id}-${sourceIdx}`}>
                        <Link to={`/group/${sourceIdx}/${group.id}/${tab}`} onClick={() => setSearchTerm("")} className="dropdown-item">
                            {<SourceDot idx={sourceIdx} autoHide namePostfix=" - " />} {group.friendly_name}
                        </Link>
                    </li>,
                );
            }
        }

        elements.sort((elA, elB) => elA.key!.localeCompare(elB.key!));

        return elements;
    }, [groups, normalizedSearchTerm, currentSourceIdx, currentGroup, tab, setSearchTerm]);

    return (
        <DialogDropdown
            buttonChildren={
                <>
                    {currentSourceIdx !== undefined && <SourceDot idx={currentSourceIdx} autoHide />}
                    {currentGroup ? currentGroup.friendly_name : t("unknown_group")}
                </>
            }
        >
            <label className="input min-h-10" key="search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <DebouncedInput onChange={setSearchTerm} placeholder={t("type_to_filter")} value={searchTerm} title={t("type_to_filter")} />
            </label>
            {items}
        </DialogDropdown>
    );
});

export default HeaderGroupSelector;
