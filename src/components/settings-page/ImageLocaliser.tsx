import { type JSX, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Device } from "../../types.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import { getZ2MDeviceImage } from "../device/index.js";

type LocaliserState = "none" | "start" | "inprogress" | "done";

type Props = {
    sourceIdx: number;
    devices: AppState["devices"][number];
};

type LStatus = "init" | "error" | "done";

async function blobToBase64(blob: Blob): Promise<string> {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
}

async function downloadImage(imageSrc: string): Promise<string> {
    const image = await fetch(imageSrc);

    if (image.ok) {
        const blob = await image.blob();

        return await blobToBase64(blob);
    }

    return Promise.reject(image.status);
}

export function ImageLocaliser({ sourceIdx, devices }: Props): JSX.Element {
    const [currentState, setCurrentState] = useState<LocaliserState>("none");
    const [localisationStatus, setLocalisationStatus] = useState<Record<string, LStatus>>({});
    const { t } = useTranslation("settings");

    const localiseImage = useCallback(
        async (device: Device) => {
            setLocalisationStatus((prev) => {
                return { ...prev, [device.ieee_address]: "init" };
            });

            const imageUrl = getZ2MDeviceImage(device);
            const imageContent = await downloadImage(imageUrl);

            await sendMessage(sourceIdx, "bridge/request/device/options", { id: device.ieee_address, options: { icon: imageContent } });
            setLocalisationStatus((prev) => ({ ...prev, [device.ieee_address]: "done" }));

            return true;
        },
        [sourceIdx],
    );

    useEffect(() => {
        if (currentState === "start") {
            for (const device of devices) {
                if (device.type !== "Coordinator") {
                    localiseImage(device)
                        .catch((err) => {
                            console.error("Error localising image", err);
                            setLocalisationStatus((prev) => ({ ...prev, [device.ieee_address]: "error" }));
                        })
                        .then();
                }
            }

            setCurrentState("inprogress");
        }
    }, [currentState, devices, localiseImage]);

    switch (currentState) {
        case "none":
            return (
                <Button className="btn btn-outline btn-primary join-item" onClick={() => setCurrentState("start")}>
                    {t("localise_images")}
                </Button>
            );
        case "inprogress":
            return (
                <ul className="menu menu-xs bg-base-200 max-w-xs w-full join-item">
                    {devices.map((device) => {
                        return (
                            <li
                                key={`${sourceIdx}-${device.ieee_address}-${device.friendly_name}`}
                                className="flex-row justify-between items-center border-b py-0.5"
                            >
                                {device.friendly_name}
                                <span className="badge badge-xs">{t(`common:${localisationStatus[device.ieee_address]}`)}</span>
                            </li>
                        );
                    })}
                </ul>
            );
        case "done":
            return <div>{t("common:unknown")}</div>;
    }

    return <div>{t("zigbee:unknown")}</div>;
}
