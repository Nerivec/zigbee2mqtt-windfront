import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Feature from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";
import { getFeatureKey } from "../../features/index.js";

type ExposesProps = {
    device: Device;
};

export default function Exposes(props: ExposesProps) {
    const { device } = props;
    const { t } = useTranslation(["exposes"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceState = useAppStore((state) => state.deviceStates[device.friendly_name] ?? {});

    const onChange = useCallback(
        async (value: Record<string, unknown>) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/set`,
                value,
            );
        },
        [sendMessage, device.ieee_address],
    );

    const onRead = useCallback(
        async (value: Record<string, unknown>) => {
            await sendMessage<"{friendlyNameOrId}/get">(
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/get`,
                value,
            );
        },
        [sendMessage, device.ieee_address],
    );

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
        t("empty_exposes_definition")
    );
}
