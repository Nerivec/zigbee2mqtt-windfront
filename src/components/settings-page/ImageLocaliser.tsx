import { type JSX, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Device } from "../../types.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import { getZ2MDeviceImage } from "../device/index.js";

type LocaliserState = "none" | "start" | "inprogress" | "done";
// Maps to i18n keys in `common` ns
type LocaliserStatus = "init" | "error" | "done";

type Props = {
    sourceIdx: number;
    devices: AppState["devices"][number];
};

async function blobToBase64(blob: Blob): Promise<string> {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
}

async function downloadImage(imageSrc: string): Promise<string | undefined> {
    try {
        const rsp = await fetch(imageSrc);

        if (rsp.ok) {
            const blob = await rsp.blob();
            const base64 = await blobToBase64(blob);

            return base64;
        }
    } catch {
        // ignore
    }
}

export function ImageLocaliser({ sourceIdx, devices }: Props): JSX.Element {
    const [currentState, setCurrentState] = useState<LocaliserState>("none");
    const [localisationStatus, setLocalisationStatus] = useState<Record<string, LocaliserStatus>>({});
    const { t } = useTranslation(["settings", "common", "zigbee"]);

    const localiseImage = useCallback(
        async (device: Device) => {
            setLocalisationStatus((prev) => {
                return { ...prev, [device.ieee_address]: "init" };
            });

            const imageUrls = getZ2MDeviceImage(device);
            let imageContent: string | undefined;

            for (const url of imageUrls) {
                imageContent = await downloadImage(url);

                if (imageContent) {
                    break;
                }
            }

            if (!imageContent) {
                console.error("Error localising image");
                setLocalisationStatus((prev) => ({ ...prev, [device.ieee_address]: "error" }));
            } else {
                await sendMessage(sourceIdx, "bridge/request/device/options", { id: device.ieee_address, options: { icon: imageContent } });
                setLocalisationStatus((prev) => ({ ...prev, [device.ieee_address]: "done" }));
            }

            return true;
        },
        [sourceIdx],
    );

    useEffect(() => {
        if (currentState === "start") {
            for (const device of devices) {
                if (device.type !== "Coordinator") {
                    localiseImage(device).catch((err) => { console.log(err); });
                }
            }

            setCurrentState("inprogress");
        }
    }, [currentState, devices, localiseImage]);

    switch (currentState) {
        case "none":
            return (
                <Button className="btn btn-outline btn-primary join-item" onClick={() => setCurrentState("start")}>
                    {t(($) => $.localise_images)}
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
                                <span className="badge badge-xs">{t(($) => $[localisationStatus[device.ieee_address]], { ns: "common" })}</span>
                            </li>
                        );
                    })}
                </ul>
            );
        case "done":
            return <div>{t(($) => $.unknown, { ns: "zigbee" })}</div>;
    }

    return <div>{t(($) => $.unknown, { ns: "zigbee" })}</div>;
}
