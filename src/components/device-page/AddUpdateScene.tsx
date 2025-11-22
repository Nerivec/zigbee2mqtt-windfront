import { type ChangeEvent, useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store";
import type { Device, DeviceState, Group, Scene } from "../../types";
import { isDevice } from "../../utils";
import { sendMessage } from "../../websocket/WebSocketManager";
import Button from "../Button";
import ConfirmButton from "../ConfirmButton";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper";
import { getFeatureKey } from "../features";
import Feature from "../features/Feature";
import InputField from "../form-fields/InputField";
import { getScenes } from "./index";

type AddUpdateSceneAction = "add" | "update";

type SceneInput = {
    action: AddUpdateSceneAction;
} & Scene;

const DEFAULT_SCENE_ID = 0;
const DEFAULT_SCENE_INPUT: SceneInput = { id: DEFAULT_SCENE_ID, name: "", action: "add" };

const createSceneInput = (scenes: Scene[], sceneId: number): SceneInput => {
    const existingScene = scenes.find((scene) => scene.id === sceneId);

    if (existingScene) {
        return {
            id: sceneId,
            name: existingScene.name,
            action: "update",
        };
    }
    return {
        ...DEFAULT_SCENE_INPUT,
        id: sceneId,
    };
};

type AddSceneProps = {
    sourceIdx: number;
    target: Device | Group;
    deviceState: DeviceState;
};

const AddUpdateScene = ({ sourceIdx, target, deviceState }: AddSceneProps) => {
    const { t } = useTranslation("scene");

    const scenes = useMemo(() => getScenes(target), [target]);
    const [sceneInput, setSceneInput] = useState<SceneInput>(() => createSceneInput(scenes, DEFAULT_SCENE_ID));

    const onScenesChange = useEffectEvent((scenes: Scene[]) => {
        setSceneInput(createSceneInput(scenes, sceneInput.id));
    });

    useEffect(() => {
        onScenesChange(scenes);
    }, [scenes]);

    useEffect(() => {
        if (scenes.length === 0) {
            setSceneInput(DEFAULT_SCENE_INPUT);
        }
    }, [scenes.length]);

    const scenesFeatures = useAppStore(
        useShallow((state) => (isDevice(target) ? (state.deviceScenesFeatures[sourceIdx]?.[target.ieee_address] ?? []) : [])),
    );

    const onCompositeChange = useCallback(
        async (value: Record<string, unknown> | unknown) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                value,
            );
        },
        [sourceIdx, target],
    );

    const onStoreClick = useCallback(async () => {
        setSceneInput({ ...sceneInput, action: "update" });
        const payload: Zigbee2MQTTAPI["{friendlyNameOrId}/set"][string] = {
            ID: sceneInput.id,
            name: sceneInput.name || `Scene ${sceneInput.id}`,
        };

        await sendMessage<"{friendlyNameOrId}/set">(
            sourceIdx,
            // @ts-expect-error templated API endpoint
            `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
            { scene_store: payload },
        );
    }, [sourceIdx, target, sceneInput]);

    const handleOnSceneIdInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const sceneId = e.target.valueAsNumber || DEFAULT_SCENE_ID;
        setSceneInput(createSceneInput(scenes, sceneId));
    };

    const isValidSceneId = useMemo(() => {
        return sceneInput.id >= 0 && sceneInput.id <= 255;
    }, [sceneInput.id]);

    return (
        <>
            <h2 className="text-lg font-semibold">{t(($) => $.add_update_header)}</h2>
            <div className="mb-3">
                <InputField
                    name="scene_id"
                    label={t(($) => $.scene_id)}
                    type="number"
                    value={sceneInput.id}
                    onChange={handleOnSceneIdInputChange}
                    min={0}
                    max={255}
                    required
                />
                <InputField
                    name="scene_name"
                    label={t(($) => $.scene_name)}
                    type="text"
                    value={sceneInput.name}
                    placeholder={`Scene ${sceneInput.id}`}
                    onChange={(e) => setSceneInput({ ...sceneInput, name: e.target.value })}
                    required
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
                                    onChange={onCompositeChange}
                                    featureWrapperClass={DashboardFeatureWrapper}
                                    minimal={true}
                                    parentFeatures={[]}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {sceneInput.action === "add" ? (
                <Button disabled={!isValidSceneId} onClick={onStoreClick} className="btn btn-primary">
                    {t(($) => $.add, { ns: "common" })}
                </Button>
            ) : (
                <ConfirmButton
                    disabled={!isValidSceneId}
                    onClick={onStoreClick}
                    className="btn btn-primary"
                    title={t(($) => $.update_scene)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                >
                    {t(($) => $.update)}
                </ConfirmButton>
            )}
        </>
    );
};

export default AddUpdateScene;
