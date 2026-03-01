import { useCallback } from "react";
import type { Device } from "../types.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

/**
 * Hook that routes device set/get commands through the Transaction Response API topics.
 * Sends to {ieee}/request/set and {ieee}/request/get instead of the legacy {ieee}/set and {ieee}/get.
 */
export function useDeviceCommands(sourceIdx: number, device: Device) {
    const onChange = useCallback(
        async (value: unknown) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/request/set`,
                value,
            );
        },
        [sourceIdx, device.ieee_address],
    );

    const onRead = useCallback(
        async (value: Record<string, unknown>) => {
            await sendMessage<"{friendlyNameOrId}/get">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/request/get`,
                value,
            );
        },
        [sourceIdx, device.ieee_address],
    );

    return { onChange, onRead };
}
