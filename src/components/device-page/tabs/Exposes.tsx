import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
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

    // Track device state updates - increments whenever deviceState object changes
    // This allows child components to detect device responses even if specific values don't change
    // IMPORTANT: Increment synchronously during render (not in useEffect) so children see the
    // updated version on the same render cycle. Effects run after render, causing a race condition.
    const deviceStateVersionRef = useRef(0);
    const prevDeviceStateRef = useRef<typeof deviceState | null>(null);

    if (deviceState !== prevDeviceStateRef.current) {
        deviceStateVersionRef.current++;
    }
    prevDeviceStateRef.current = deviceState;

    const deviceStateVersion = deviceStateVersionRef.current;

    const onChange = useCallback(
        async (value: Record<string, unknown>, transactionId?: string) => {
            const payload = transactionId ? { ...value, z2m: { request_id: transactionId } } : value;
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/set`,
                payload,
            );
        },
        [sourceIdx, device.ieee_address],
    );

    const onRead = useCallback(
        async (value: Record<string, unknown>, transactionId?: string) => {
            const payload = transactionId ? { ...value, z2m: { request_id: transactionId } } : value;
            await sendMessage<"{friendlyNameOrId}/get">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/get`,
                payload,
            );
        },
        [sourceIdx, device.ieee_address],
    );

    return device.definition?.exposes?.length ? (
        <div className="list bg-base-100">
            {device.definition.exposes.map((expose) => (
                <Feature
                    key={getFeatureKey(expose)}
                    feature={expose}
                    device={device}
                    deviceState={deviceState}
                    deviceStateVersion={deviceStateVersion}
                    onChange={onChange}
                    onRead={onRead}
                    featureWrapperClass={FeatureWrapper}
                    parentFeatures={[]}
                    sourceIdx={sourceIdx}
                />
            ))}
        </div>
    ) : (
        t(($) => $.empty_exposes_definition)
    );
}
