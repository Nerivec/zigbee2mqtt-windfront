import { type ChangeEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTScene } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store";
import type { Device, DeviceState, Group } from "../../types";
import { isDevice } from "../../utils";
import Button from "../Button";
import ConfirmButton from "../ConfirmButton";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper";
import { getFeatureKey } from "../features";
import Feature from "../features/Feature";
import InputField from "../form-fields/InputField";
import { useSceneAddUpdate } from "./hooks/useSceneAddUpdate";
import { getScenes } from "./index";

const DEFAULT_SCENE_ID = 0;

type AddSceneProps = {
    sourceIdx: number;
    target: Device | Group;
    deviceState: DeviceState;
};

const AddUpdateScene = ({ sourceIdx, target, deviceState }: AddSceneProps) => {
    const { t } = useTranslation("scene");

    const scenes = useMemo(() => getScenes(target), [target]);

    const [sceneId, setSceneId] = useState<number>(DEFAULT_SCENE_ID);
    const [name, setName] = useState<string | null>(null);

    const existingScene = useMemo(() => scenes.find((scene) => scene.id === sceneId), [scenes, sceneId]);

    const { loading, inFlight, sendEntitySetMessage, submit } = useSceneAddUpdate({ sourceIdx, target });

    const isUpdate = inFlight ? inFlight.isUpdate : !!existingScene;
    const effectiveName = inFlight ? inFlight.name : getEffectiveSceneName(name, existingScene);
    const isValidSceneId = sceneId >= 0 && sceneId <= 255;
    const isButtonDisabled = !isValidSceneId || !effectiveName || loading;

    const scenesFeatures = useAppStore(
        useShallow((state) => (isDevice(target) ? (state.deviceScenesFeatures[sourceIdx]?.[target.ieee_address] ?? []) : [])),
    );

    const handleOnSceneIdInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSceneId(e.target.valueAsNumber || DEFAULT_SCENE_ID);
        setName(null);
    };

    const handleSubmit = () => {
        void submit({ sceneId, name: effectiveName, isUpdate: !!existingScene });
    };

    return (
        <>
            <h2 className="text-lg font-semibold">{t(($) => $.add_update_header)}</h2>
            <div className="mb-3">
                <InputField
                    name="scene_id"
                    label={t(($) => $.scene_id)}
                    type="number"
                    value={sceneId}
                    onChange={handleOnSceneIdInputChange}
                    min={0}
                    max={255}
                    required
                    disabled={loading}
                />
                <InputField
                    name="scene_name"
                    label={t(($) => $.scene_name)}
                    type="text"
                    value={effectiveName}
                    placeholder={`Scene ${sceneId}`}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                />
                {scenesFeatures.length > 0 && (
                    <div className="card card-border bg-base-100 shadow my-2">
                        <div className="card-body p-4">
                            {scenesFeatures.map((feature) => (
                                <Feature
                                    key={getFeatureKey(feature)}
                                    feature={feature}
                                    device={target as Device /* no feature for groups */}
                                    deviceState={deviceState}
                                    onChange={sendEntitySetMessage}
                                    featureWrapperClass={DashboardFeatureWrapper}
                                    minimal={true}
                                    parentFeatures={[]}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {!isUpdate ? (
                <Button disabled={isButtonDisabled} onClick={handleSubmit} className="btn btn-primary" title={t(($) => $.add_scene)}>
                    {loading ? <span className="loading loading-spinner loading-sm" /> : t(($) => $.add, { ns: "common" })}
                </Button>
            ) : (
                <ConfirmButton
                    disabled={isButtonDisabled}
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    title={t(($) => $.update_scene)}
                    modalDescription={t(($) => $.update_confirmation_message)}
                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                >
                    {loading ? <span className="loading loading-spinner loading-sm" /> : t(($) => $.update)}
                </ConfirmButton>
            )}
        </>
    );
};

export default AddUpdateScene;

function getEffectiveSceneName(name: string | null, existingScene: Zigbee2MQTTScene | undefined): string {
    if (name === null) {
        return existingScene?.name || "";
    }
    return name;
}
