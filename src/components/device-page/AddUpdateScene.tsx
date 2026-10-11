import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store";
import type { Device, DeviceState, Group } from "../../types";
import { isDevice } from "../../utils";
import { sendMessage } from "../../websocket/WebSocketManager";
import Button from "../Button";
import ConfirmButton from "../ConfirmButton";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper";
import { getFeatureKey } from "../features";
import Feature from "../features/Feature";
import InputField from "../form-fields/InputField";
import { getScenes } from "./index";

const DEFAULT_SCENE_ID = 0;
const SCENE_CONFIRM_TIMEOUT = 5000;

type AddSceneProps = {
    sourceIdx: number;
    target: Device | Group;
    deviceState: DeviceState;
};

const AddUpdateScene = ({ sourceIdx, target, deviceState }: AddSceneProps) => {
    const { t } = useTranslation("scene");

    const scenes = useMemo(() => getScenes(target), [target]);

    const [sceneId, setSceneId] = useState<number>(DEFAULT_SCENE_ID);
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);
    const [busyName, setBusyName] = useState<string | null>(null);

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

    const sceneExistsInStore = useCallback(
        (id: number) => {
            const state = useAppStore.getState();
            const current = isDevice(target)
                ? state.devices[sourceIdx]?.find((device) => device.ieee_address === (target as Device).ieee_address)
                : state.groups[sourceIdx]?.find((group) => group.id === (target as Group).id);

            return current ? getScenes(current).some((scene) => scene.id === id) : false;
        },
        [sourceIdx, target],
    );

    const waitForScene = useCallback(
        (id: number, shouldBePresent: boolean) =>
            new Promise<boolean>((resolve) => {
                if (sceneExistsInStore(id) === shouldBePresent) {
                    resolve(true);
                    return;
                }

                let settled = false;

                const timeout = setTimeout(() => {
                    settled = true;
                    unsub();
                    resolve(false);
                }, SCENE_CONFIRM_TIMEOUT);

                const unsub = useAppStore.subscribe((state, prevState) => {
                    if (
                        // ignore store updates that don't touch this source's device/group lists (deviceStates, logs, metrics, ...)
                        settled ||
                        (state.devices[sourceIdx] === prevState.devices[sourceIdx] && state.groups[sourceIdx] === prevState.groups[sourceIdx])
                    ) {
                        return;
                    }

                    if (sceneExistsInStore(id) === shouldBePresent) {
                        settled = true;
                        clearTimeout(timeout);
                        unsub();
                        resolve(true);
                    }
                });
            }),
        [sceneExistsInStore, sourceIdx],
    );

    const onStoreClick = useCallback(async () => {
        const storeName = effectiveName || `Scene ${sceneId}`;
        const payload: Zigbee2MQTTAPI["{friendlyNameOrId}/set"][string] = {
            ID: sceneId,
            name: storeName,
        };

        setBusy(true);
        setBusyName(storeName);

        try {
            if (existingScene) {
                await sendMessage<"{friendlyNameOrId}/set">(
                    sourceIdx,
                    // @ts-expect-error templated API endpoint
                    `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                    { scene_remove: sceneId },
                );

                if (!(await waitForScene(sceneId, false))) {
                    useAppStore.getState().addToast({
                        sourceIdx,
                        topic: `${target.friendly_name}/set`,
                        status: "error",
                        error: t(($) => $.remove_timeout, { seconds: SCENE_CONFIRM_TIMEOUT / 1000 }),
                    });

                    return;
                }
            }

            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                { scene_store: payload },
            );

            if (!(await waitForScene(sceneId, true))) {
                useAppStore.getState().addToast({
                    sourceIdx,
                    topic: `${target.friendly_name}/set`,
                    status: "error",
                    error: t(($) => $.store_timeout, { seconds: SCENE_CONFIRM_TIMEOUT / 1000 }),
                });
            }
        } finally {
            setBusy(false);
            setBusyName(null);
        }
    }, [sourceIdx, target, sceneId, effectiveName, existingScene, waitForScene, t]);

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
                    disabled={busy}
                />
                <InputField
                    name="scene_name"
                    label={t(($) => $.scene_name)}
                    type="text"
                    value={busy ? (busyName ?? "") : effectiveName}
                    placeholder={`Scene ${sceneId}`}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={busy}
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
                <Button disabled={!isValidSceneId || busy} onClick={onStoreClick} className="btn btn-primary" title={t(($) => $.add_scene)}>
                    {busy ? <span className="loading loading-spinner loading-sm" /> : t(($) => $.add, { ns: "common" })}
                </Button>
            ) : (
                <ConfirmButton
                    disabled={!isValidSceneId || busy}
                    onClick={onStoreClick}
                    className="btn btn-primary"
                    title={t(($) => $.update_scene)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                >
                    {busy ? <span className="loading loading-spinner loading-sm" /> : t(($) => $.update)}
                </ConfirmButton>
            )}
        </>
    );
};

export default AddUpdateScene;
