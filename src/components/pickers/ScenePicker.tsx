import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Scene } from "../../types.js";
import InputField from "../form-fields/InputField.js";
import SelectField from "../form-fields/SelectField.js";

type ScenePickerProps = {
    value?: Scene;
    scenes: Scene[];
    onSceneSelected: (sceneId: number) => void;
};

const ScenePicker = memo(({ onSceneSelected, scenes = [], value }: ScenePickerProps) => {
    const { t } = useTranslation("scene");

    return scenes.length > 0 ? (
        <SelectField
            name="scene_picker"
            label={t("scene_name")}
            value={value?.id ?? ""}
            onChange={(e) => !e.target.validationMessage && !!e.target.value && onSceneSelected(Number.parseInt(e.target.value, 10))}
        >
            <option value="" disabled>
                {t("select_scene")}
            </option>
            {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                    {scene.id}: {scene.name}
                </option>
            ))}
        </SelectField>
    ) : (
        <InputField
            name="scene_picker"
            label={t("scene_id")}
            type="number"
            value={value?.id ?? ""}
            onChange={(e) => !e.target.validationMessage && !!e.target.value && onSceneSelected(e.target.valueAsNumber)}
            min={0}
            max={255}
        />
    );
});

export default ScenePicker;
