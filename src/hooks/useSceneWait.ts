import { useCallback } from "react";
import { getScenes } from "../components/device-page";
import { useAppStore } from "../store";
import type { Device, Group } from "../types";
import { isDevice } from "../utils";

export const DEFAULT_SCENE_CONFIRM_TIMEOUT_MS = 10000;

export function useSceneWait(sourceIdx: number, target: Device | Group) {
    const sceneExistsInStore = useCallback(
        (id: number): boolean => {
            const state = useAppStore.getState();
            const current = isDevice(target)
                ? state.devices[sourceIdx]?.find((device) => device.ieee_address === target.ieee_address)
                : state.groups[sourceIdx]?.find((group) => group.id === target.id);

            return current ? getScenes(current).some((scene) => scene.id === id) : false;
        },
        [sourceIdx, target],
    );

    const sceneInDesiredAvailabilityAfterTimeout = useCallback(
        (id: number, shouldBePresent: boolean, timeoutMs: number = DEFAULT_SCENE_CONFIRM_TIMEOUT_MS): Promise<boolean> => {
            return new Promise<boolean>((resolve) => {
                if (sceneExistsInStore(id) === shouldBePresent) {
                    resolve(true);
                    return;
                }

                let settled = false;

                const failedTimeout = setTimeout(() => {
                    settled = true;
                    unsubscribe();
                    resolve(false);
                }, timeoutMs);

                const unsubscribe = useAppStore.subscribe((state, prevState) => {
                    if (
                        settled ||
                        // ignore store updates that don't touch this source's device/group lists
                        (state.devices[sourceIdx] === prevState.devices[sourceIdx] && state.groups[sourceIdx] === prevState.groups[sourceIdx])
                    ) {
                        return;
                    }

                    if (sceneExistsInStore(id) === shouldBePresent) {
                        settled = true;
                        clearTimeout(failedTimeout);
                        unsubscribe();
                        resolve(true);
                    }
                });
            });
        },
        [sceneExistsInStore, sourceIdx],
    );

    return { sceneExistsInStore, waitForScene: sceneInDesiredAvailabilityAfterTimeout };
}
