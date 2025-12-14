import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CreatableSelect from "react-select/creatable";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { BaseSelectOption, Scene } from "../../types.js";

type ScenePickerProps = {
    scenes: Scene[];
    disabled?: boolean;
    onSceneSelected: (sceneId: number) => void;
};

const ScenePicker = memo(({ onSceneSelected, scenes = [], disabled }: ScenePickerProps) => {
    const { t } = useTranslation("scene");

    const options = useMemo(
        (): BaseSelectOption[] =>
            scenes
                .map((scene) => ({ value: `${scene.id}`, label: `${scene.id}: ${scene.name}` }))
                .sort((elA, elB) => elA.label.localeCompare(elB.label)),
        [scenes],
    );

    return (
        <fieldset className="fieldset">
            <CreatableSelect
                unstyled
                placeholder={t(($) => $.scene_name)}
                aria-label={t(($) => $.scene_name)}
                options={options}
                isSearchable
                isDisabled={disabled}
                onChange={(option) => {
                    if (option != null) {
                        onSceneSelected(Number.parseInt(option.value, 10));
                    }
                }}
                className="min-w-64"
                classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
            />
        </fieldset>
    );
});

export default ScenePicker;
