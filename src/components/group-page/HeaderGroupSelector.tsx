import { memo, type ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Select, { type SingleValue } from "react-select";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { TabName } from "../../pages/GroupPage.js";
import { API_URLS, useAppStore } from "../../store.js";
import type { BaseSelectOption, Group } from "../../types.js";
import SourceDot from "../SourceDot.js";

interface HeaderGroupSelectorProps {
    currentSourceIdx: number | undefined;
    currentGroup: Group | undefined;
    tab?: TabName;
}

interface SelectOption extends BaseSelectOption<ReactNode> {
    name: string;
    link: string;
}

const HeaderGroupSelector = memo(({ currentSourceIdx, currentGroup, tab = "devices" }: HeaderGroupSelectorProps) => {
    const { t } = useTranslation("common");
    const groups = useAppStore((state) => state.groups);
    const navigate = useNavigate();

    const onSelectHandler = useCallback(
        (option: SingleValue<SelectOption>) => {
            if (option) {
                void navigate(option.link);
            }
        },
        [navigate],
    );

    const options = useMemo(() => {
        const elements: SelectOption[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const group of groups[sourceIdx]) {
                if (sourceIdx === currentSourceIdx && group.id === currentGroup?.id) {
                    continue;
                }

                elements.push({
                    value: group.friendly_name,
                    label: (
                        <>
                            <SourceDot idx={sourceIdx} autoHide namePostfix=" – " /> {group.friendly_name}
                        </>
                    ),
                    name: `${sourceIdx} ${group.friendly_name}`,
                    link: `/group/${sourceIdx}/${group.id}/${tab}`,
                });
            }
        }

        elements.sort((elA, elB) => elA.name.localeCompare(elB.name));

        return elements;
    }, [groups, currentSourceIdx, currentGroup, tab]);

    return (
        <Select
            unstyled
            placeholder={
                currentGroup && currentSourceIdx !== undefined ? (
                    <>
                        <SourceDot idx={currentSourceIdx} autoHide namePostfix=" – " /> {currentGroup.friendly_name}
                    </>
                ) : (
                    t(($) => $.select_group)
                )
            }
            aria-label={t(($) => $.select_group)}
            options={options}
            isSearchable
            onChange={onSelectHandler}
            className="min-w-48 sm:w-auto me-2"
            classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
        />
    );
});

export default HeaderGroupSelector;
