import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { DEFAULT_SCENE_CONFIRM_TIMEOUT_MS, useSceneWait } from "../../../hooks/useSceneWait";
import { useAppStore } from "../../../store";
import type { Device, Group } from "../../../types";
import { sendMessage } from "../../../websocket/WebSocketManager";

export type SceneSubmitParams = {
    sceneId: number;
    name: string;
    isUpdate: boolean;
};

type UseSceneAddUpdateResult = {
    loading: boolean;
    inFlight: SceneSubmitParams | null;
    sendEntitySetMessage: (value: Record<string, unknown> | unknown) => Promise<void>;
    submit: (params: SceneSubmitParams) => Promise<void>;
};

type UseSceneAddUpdateParams = {
    sourceIdx: number;
    target: Device | Group;
};

type EntitySetRequestEndpoint = "{friendlyNameOrId}/set";

export function useSceneAddUpdate({ sourceIdx, target }: UseSceneAddUpdateParams): UseSceneAddUpdateResult {
    const { t } = useTranslation("scene");
    const { waitForScene } = useSceneWait(sourceIdx, target);

    const [inFlight, setInFlight] = useState<SceneSubmitParams | null>(null);

    const sendEntitySetMessage = useCallback(
        async (value: Record<string, unknown> | unknown) => {
            await sendMessage<EntitySetRequestEndpoint>(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                value,
            );
        },
        [sourceIdx, target],
    );

    const createToast = useCallback(
        (message: string) => {
            useAppStore.getState().addToast({
                sourceIdx,
                topic: `${target.friendly_name}/set`,
                status: "error",
                error: message,
            });
        },
        [sourceIdx, target.friendly_name],
    );

    const submit = useCallback(
        async ({ sceneId, name, isUpdate }: SceneSubmitParams) => {
            const payload: Zigbee2MQTTAPI[EntitySetRequestEndpoint][string] = { ID: sceneId, name };

            setInFlight({ sceneId, name, isUpdate });

            try {
                if (isUpdate) {
                    await sendEntitySetMessage({ scene_remove: sceneId });

                    if (!(await waitForScene(sceneId, false, DEFAULT_SCENE_CONFIRM_TIMEOUT_MS))) {
                        createToast(t(($) => $.remove_timeout, { seconds: DEFAULT_SCENE_CONFIRM_TIMEOUT_MS / 1000 }));
                        return;
                    }
                }

                await sendEntitySetMessage({ scene_store: payload });

                if (!(await waitForScene(sceneId, true, DEFAULT_SCENE_CONFIRM_TIMEOUT_MS))) {
                    createToast(t(($) => $.store_timeout, { seconds: DEFAULT_SCENE_CONFIRM_TIMEOUT_MS / 1000 }));
                }
            } finally {
                setInFlight(null);
            }
        },
        [waitForScene, t, sendEntitySetMessage, createToast],
    );

    return { loading: inFlight !== null, inFlight, sendEntitySetMessage, submit };
}
