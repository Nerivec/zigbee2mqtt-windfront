import { memo } from "react";
import { useImage } from "react-image";
import genericDevice from "../../images/generic-zigbee-device.png";
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

    if (fromZ2MDocs !== genericDevice) {
        srcList.push(genericDevice);
    }

    const { src } = useImage({ srcList });

    return <img alt={device.ieee_address} crossOrigin={"anonymous"} src={src} className={className} />;
});

export default LazyImage;
