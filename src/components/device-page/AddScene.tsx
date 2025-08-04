import { memo, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { Device, DeviceState, Group } from "../../types.js";
import { filterExposes, isDevice } from "../../utils.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import Button from "../Button.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import Feature from "../features/Feature.js";
import { getFeatureKey } from "../features/index.js";
import InputField from "../form-fields/InputField.js";
import { getScenes, isValidForScenes } from "./index.js";

type AddSceneProps = {
    target: Device | Group;
    deviceState: DeviceState;
};

const AddScene = memo((props: AddSceneProps) => {
    const { target, deviceState } = props;
    const { t } = useTranslation("scene");
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const [sceneId, setSceneId] = useState<number>(0);
    const [sceneName, setSceneName] = useState<string>("");
    const scenes = useMemo(() => getScenes(target), [target]);
    const filteredFeatures = useMemo(
        () => (isDevice(target) && target.definition ? filterExposes(target.definition.exposes, isValidForScenes) : []),
        [target],
    );

    const onCompositeChange = useCallback(
        async (value: Record<string, unknown> | unknown) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                value,
            );
        },
        [sendMessage, target],
    );

    const onStoreClick = useCallback(async () => {
        const payload: Zigbee2MQTTAPI["{friendlyNameOrId}/set"][string] = { ID: sceneId, name: sceneName || `Scene ${sceneId}` };

        await sendMessage<"{friendlyNameOrId}/set">(
            // @ts-expect-error templated API endpoint
            `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
            { scene_store: payload },
        );
    }, [sendMessage, target, sceneId, sceneName]);

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
                />
                <InputField
                    name="scene_name"
                    label={t("scene_name")}
                    type="text"
                    value={sceneName}
                    placeholder={`Scene ${sceneId}`}
                    onChange={(e) => setSceneName(e.target.value)}
                />
                {filteredFeatures.length > 0 && (
                    <div className="card card-border bg-base-200 shadow my-2">
                        <div className="card-body">
                            {filteredFeatures.map((feature) => (
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
