import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { HomePageGroupWithScenesEntry } from "../../pages/HomePage.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import SourceDot from "../SourceDot.js";

export interface GroupScenesTileProps extends HomePageGroupWithScenesEntry {}

const GroupScenesTile = memo(({ sourceIdx, group }: GroupScenesTileProps) => {
    const { t } = useTranslation("zigbee");
    const onSceneClick = useCallback(
        async (sceneId: number) =>
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${group.friendly_name}/set`, // TODO: swap to ID/ieee_address
                { scene_recall: sceneId },
            ),
        [sourceIdx, group.friendly_name],
    );

    return (
        <article className="card bg-base-200 rounded-box shadow-md">
            <div className="card-body p-2">
                <div className="flex flex-row items-center gap-3 w-full">
                    <div className="min-w-0">
                        <div className="truncate">
                            {t(($) => $.scenes)}:{" "}
                            <Link to={`/group/${sourceIdx}/${group.id}/devices`} className="link link-hover font-semibold">
                                {group.friendly_name}
                            </Link>
                        </div>
                        <span className="absolute top-2 right-2">
                            <SourceDot idx={sourceIdx} autoHide />
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-row flex-wrap gap-1 mx-2 mb-2 justify-around items-center">
                {group.scenes.map((scene) => (
                    <Button<number> key={scene.id} className="btn btn-outline btn-primary btn-sm" onClick={onSceneClick} item={scene.id}>
                        {scene.name}
                    </Button>
                ))}
            </div>
        </article>
    );
});

export default GroupScenesTile;
