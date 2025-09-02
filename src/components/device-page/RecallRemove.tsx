import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device, Group, Scene } from "../../types.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";
import { getScenes } from "./index.js";
import ScenePicker from "./ScenePicker.js";

interface RecallRemoveProps {
    sourceIdx: number;
    target: Device | Group;
}

const RecallRemove = memo(({ sourceIdx, target }: RecallRemoveProps) => {
    const { t } = useTranslation(["scene", "common"]);
    const [scene, setScene] = useState<Scene>({ id: 0, name: "Scene 0" });
    const [sceneIsNotSelected, setsceneIsNotSelected] = useState<boolean>(true);
    const scenes = useMemo(() => getScenes(target), [target]);

    const onSceneSelected = useCallback(
        (sceneId: number) => {
            setsceneIsNotSelected(false);

            const foundScene = scenes.find((s) => s.id === sceneId);

            if (foundScene !== undefined) {
                setScene(foundScene);
            } else {
                setScene({ id: sceneId, name: `Scene ${sceneId}` });
            }
        },
        [scenes],
    );

    const onRecallClick = useCallback(
        async () =>
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                { scene_recall: scene.id },
            ),
        [sourceIdx, target.friendly_name, scene.id],
    );

    const onRemoveClick = useCallback(
        async () =>
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                { scene_remove: scene.id },
            ),
        [sourceIdx, target.friendly_name, scene.id],
    );

    const onRemoveAllClick = useCallback(
        async () =>
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                { scene_remove_all: "" },
            ),
        [sourceIdx, target.friendly_name],
    );

    return (
        <>
            <h2 className="text-lg font-semibold">{t("manage_scenes_header")}</h2>
            <div className="mb-3">
                <ScenePicker onSceneSelected={onSceneSelected} value={sceneIsNotSelected ? undefined : scene} scenes={scenes} />
            </div>
            <div className="join join-horizontal">
                <Button disabled={sceneIsNotSelected} onClick={onRecallClick} className="btn btn-success join-item">
                    {t("recall")}
                </Button>
                <ConfirmButton
                    disabled={sceneIsNotSelected}
                    onClick={onRemoveClick}
                    className="btn btn-error join-item"
                    title={t("remove")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("remove")}
                </ConfirmButton>
                <ConfirmButton
                    onClick={onRemoveAllClick}
                    className="btn btn-error btn-outline join-item"
                    title={t("remove_all")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("remove_all")}
                </ConfirmButton>
            </div>
        </>
    );
});

export default RecallRemove;
