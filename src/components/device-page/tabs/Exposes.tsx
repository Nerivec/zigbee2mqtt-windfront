import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useDeviceCommands } from "../../../hooks/useDeviceCommands.js";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import Feature from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";
import { getFeatureKey } from "../../features/index.js";

type ExposesProps = {
    sourceIdx: number;
    device: Device;
};

export default function Exposes({ sourceIdx, device }: ExposesProps) {
    const { t } = useTranslation("common");
    const deviceState = useAppStore(useShallow((state) => state.deviceStates[sourceIdx][device.friendly_name] ?? {}));
    const { onChange, onRead } = useDeviceCommands(sourceIdx, device);

    return device.definition?.exposes?.length ? (
        <div className="list bg-base-100">
            {device.definition.exposes.map((expose) => (
                <Feature
                    key={getFeatureKey(expose)}
                    feature={expose}
                    device={device}
                    deviceState={deviceState}
                    onChange={onChange}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                    parentFeatures={[]}
                />
            ))}
        </div>
    ) : (
        t(($) => $.empty_exposes_definition)
    );
}
