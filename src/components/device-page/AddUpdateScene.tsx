import {type ChangeEvent, useCallback, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import type {Zigbee2MQTTAPI} from "zigbee2mqtt";
import {useShallow} from "zustand/react/shallow";
import {useAppStore} from "../../store";
import type {Device, DeviceState, Group} from "../../types";
import {isDevice} from "../../utils";
import {sendMessage} from "../../websocket/WebSocketManager";
import Button from "../Button";
import ConfirmButton from "../ConfirmButton";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper";
import {getFeatureKey} from "../features";
import Feature from "../features/Feature";
import InputField from "../form-fields/InputField";
import {getScenes} from "./index";

const DEFAULT_SCENE_ID = 0;

type AddSceneProps = {
    sourceIdx: number;
    target: Device | Group;
    deviceState: DeviceState;
};

const AddUpdateScene = ({sourceIdx, target, deviceState}: AddSceneProps) => {
    const {t} = useTranslation("scene");

    const scenes = useMemo(() => getScenes(target), [target]);

    const [sceneId, setSceneId] = useState<number>(DEFAULT_SCENE_ID);
    const [name, setName] = useState("");

    const existingScene = useMemo(() => scenes.find((scene) => scene.id === sceneId), [scenes, sceneId]);

    const action = existingScene ? "update" : "add";
    const effectiveName = name || existingScene?.name || "";
    const isValidSceneId = sceneId >= 0 && sceneId <= 255;

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
        const payload: Zigbee2MQTTAPI["{friendlyNameOrId}/set"][string] = {
            ID: sceneId,
            name: effectiveName || `Scene ${sceneId}`,
        };

        await sendMessage<"{friendlyNameOrId}/set">(
            sourceIdx,
            // @ts-expect-error templated API endpoint
            `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
            {scene_store: payload},
        );
    }, [sourceIdx, target, sceneId, effectiveName]);

    const handleOnSceneIdInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSceneId(e.target.valueAsNumber || DEFAULT_SCENE_ID);
        setName("");
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
                />
                <InputField
                    name="scene_name"
                    label={t(($) => $.scene_name)}
                    type="text"
                    value={effectiveName}
                    placeholder={`Scene ${sceneId}`}
                    onChange={(e) => setName(e.target.value)}
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
            {action === "add" ? (
                <Button disabled={!isValidSceneId} onClick={onStoreClick} className="btn btn-primary"
                        title={t(($) => $.add_scene)}>
                    {t(($) => $.add, {ns: "common"})}
                </Button>
            ) : (
                <ConfirmButton
                    disabled={!isValidSceneId}
                    onClick={onStoreClick}
                    className="btn btn-primary"
                    title={t(($) => $.update_scene)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt, {ns: "common"})}
                    modalCancelLabel={t(($) => $.cancel, {ns: "common"})}
                >
                    {t(($) => $.update)}
                </ConfirmButton>
            )}
        </>
    );
};

export default AddUpdateScene;
