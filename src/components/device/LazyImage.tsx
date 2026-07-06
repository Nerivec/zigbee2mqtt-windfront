import { memo } from "react";
import { useImage } from "react-image";
import genericDevice from "../../images/generic-zigbee-device.png";
import esphomeDevice from "../../images/ESPH-mark-color.png";
import type { Device } from "../../types.js";
import { getZ2MDeviceImage } from "./index.js";

type LazyImageProps = {
    device?: Device;
    className?: string;
};

const LazyImage = memo(({ device = {} as Device, className }: Readonly<LazyImageProps>) => {
    const fromDefinition = device.definition?.icon;
    const fromZ2MDocs = getZ2MDeviceImage(device);
    const srcList: string[] = [];

    if (fromDefinition) {
        srcList.push(fromDefinition);
    }

    if (fromZ2MDocs) {
        srcList.push(fromZ2MDocs);
    }

    const genericImage = device.definition?.vendor === "esphome" ? esphomeDevice : genericDevice;
    if (fromZ2MDocs !== genericImage) {
        srcList.push(genericImage);
    }

    const { src } = useImage({ srcList });

    return <img alt={device.ieee_address} src={src} className={`object-contain ${className ?? ""}`} />;
});

export default LazyImage;
