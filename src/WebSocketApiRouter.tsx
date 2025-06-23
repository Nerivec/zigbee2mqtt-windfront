import type { PropsWithChildren } from "react";
import { useApiWebSocket } from "./hooks/useApiWebSocket.js";
import { WebSocketApiRouterContext } from "./WebSocketApiRouterContext.js";

export function WebSocketApiRouter({ children }: PropsWithChildren) {
    const webSocket = useApiWebSocket();

    return <WebSocketApiRouterContext.Provider value={webSocket}>{children}</WebSocketApiRouterContext.Provider>;
}
