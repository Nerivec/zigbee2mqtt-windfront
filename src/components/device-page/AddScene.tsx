import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store.js";
import type { Device, DeviceState, Group } from "../../types.js";
import { isDevice } from "../../utils.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import Feature from "../features/Feature.js";
import { getFeatureKey } from "../features/index.js";
import InputField from "../form-fields/InputField.js";
import { getScenes } from "./index.js";

type AddSceneProps = {
    sourceIdx: number;
    target: Device | Group;
    deviceState: DeviceState;
};

const AddScene = memo(({ sourceIdx, target, deviceState }: AddSceneProps) => {
    const { t } = useTranslation("scene");
    const [sceneId, setSceneId] = useState<number>(0);
    const [sceneName, setSceneName] = useState<string>("");
    const scenes = useMemo(() => getScenes(target), [target]);
    const scenesFeatures = useAppStore(
        useShallow((state) => (isDevice(target) ? (state.deviceScenesFeatures[sourceIdx][target.ieee_address] ?? []) : [])),
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
        const payload: Zigbee2MQTTAPI["{friendlyNameOrId}/set"][string] = { ID: sceneId, name: sceneName || `Scene ${sceneId}` };

        await sendMessage<"{friendlyNameOrId}/set">(
            sourceIdx,
            // @ts-expect-error templated API endpoint
            `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
            { scene_store: payload },
        );
    }, [sourceIdx, target, sceneId, sceneName]);

    const isValidSceneId = useMemo(() => {
        return sceneId >= 0 && sceneId <= 255 && !scenes.find((s) => s.id === sceneId);
    }, [sceneId, scenes]);

    return (
        <>
            <h2 className="text-lg font-semibold">{t("add_update_header")}</h2>
            <div className="mb-3">
                <InputField
                    name="scene_id"
                    label={t("scene_id")}
                    type="number"
                    value={sceneId}
                    onChange={(e) => !!e.target.value && setSceneId(e.target.valueAsNumber)}
                    min={0}
                    max={255}
                    required
                />
                <InputField
                    name="scene_name"
                    label={t("scene_name")}
                    type="text"
                    value={sceneName}
                    placeholder={`Scene ${sceneId}`}
                    onChange={(e) => setSceneName(e.target.value)}
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
            <Button disabled={!isValidSceneId} onClick={onStoreClick} className="btn btn-primary">
                {t("store")}
            </Button>
        </>
    );
});

export default AddScene;
