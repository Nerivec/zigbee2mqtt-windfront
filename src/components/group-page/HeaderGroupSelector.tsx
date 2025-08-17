import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { TabName } from "../../pages/GroupPage.js";
import { API_URLS, useAppStore } from "../../store.js";
import type { Group } from "../../types.js";
import PopoverDropdown from "../PopoverDropdown.js";
import SourceDot from "../SourceDot.js";

interface HeaderGroupSelectorProps {
    currentSourceIdx: number | undefined;
    currentGroup: Group | undefined;
    tab?: TabName;
}

const HeaderGroupSelector = memo(({ currentSourceIdx, currentGroup, tab = "devices" }: HeaderGroupSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { t } = useTranslation("common");
    const groups = useAppStore((state) => state.groups);

    const items = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const group of groups[sourceIdx]) {
                if (
                    group.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (sourceIdx !== currentSourceIdx || group.id !== currentGroup?.id)
                ) {
                    elements.push(
                        <li key={`${sourceIdx}-${group.id}-${group.friendly_name}`}>
                            <Link to={`/group/${sourceIdx}/${group.id}/${tab}`} onClick={() => setSearchTerm("")} className="dropdown-item">
                                {<SourceDot idx={sourceIdx} autoHide />} {group.friendly_name}
                            </Link>
                        </li>,
                    );
                }
            }
        }

        return elements;
    }, [groups, searchTerm, currentSourceIdx, currentGroup, tab]);

    return (
        <PopoverDropdown
            name="header-group-selector"
            buttonChildren={
                <>
                    {currentSourceIdx !== undefined && <SourceDot idx={currentSourceIdx} autoHide />}
                    {currentGroup ? `#${currentGroup.id} - ${currentGroup.friendly_name}` : t("unknown_group")}
                </>
            }
            dropdownStyle="dropdown-start"
        >
            <label className="input" key="search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input type="search" placeholder={t("type_to_filter")} onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
            </label>
            {items}
        </PopoverDropdown>
    );
});

export default HeaderGroupSelector;
