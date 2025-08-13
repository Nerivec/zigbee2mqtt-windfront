import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { TabName } from "../../pages/GroupPage.js";
import type { AppState } from "../../store.js";
import type { Group } from "../../types.js";
import PopoverDropdown from "../PopoverDropdown.js";

interface HeaderGroupSelectorProps {
    groups: AppState["groups"];
    currentGroup: Group | undefined;
    tab?: TabName;
}

const HeaderGroupSelector = memo(({ groups, currentGroup, tab = "devices" }: HeaderGroupSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { t } = useTranslation("common");
    const items = useMemo(
        () =>
            groups
                .filter((group) => group.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) && group.id !== currentGroup?.id)
                .map((group) => (
                    <li key={group.id}>
                        <Link to={`/group/${group.id}/${tab}`} onClick={() => setSearchTerm("")} className="dropdown-item">
                            {group.friendly_name}
                        </Link>
                    </li>
                )),
        [groups, searchTerm, currentGroup, tab],
    );

    return (
        <PopoverDropdown
            name="header-group-selector"
            buttonChildren={`${currentGroup ? `#${currentGroup.id} - ${currentGroup.friendly_name}` : t("unknown_group")}`}
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
