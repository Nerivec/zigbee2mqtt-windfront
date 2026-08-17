import { memo } from "react";
import { useImage } from "react-image";
import genericDevice from "../../images/generic-zigbee-device.svg";
import { GenericDevice } from "../../images/generic-zigbee-device";
import type { Device } from "../../types.js";
import { getZ2MDeviceImage } from "./index.js";

type LazyImageProps = {
    device?: Device;
    className?: string;
};

const LazyImage = memo(({ device = {} as Device, className }: Readonly<LazyImageProps>) => {
    const fromDefinition = device.definition?.icon;
    const fromZ2MDocs = getZ2MDeviceImage(device);
    const srcList: string[] = fromDefinition ? [fromDefinition] : [];

    if (fromZ2MDocs) {
        srcList.push(...fromZ2MDocs);
    }

    srcList.push(genericDevice);

    const { src } = useImage({ srcList });

    if (src === genericDevice) {
        return <GenericDevice className={`text-base-content object-contain ${className ?? ""}`} />;
    }

    return <img alt={device.ieee_address} src={src} className={`object-contain ${className ?? ""}`} />;
});

export default LazyImage;
