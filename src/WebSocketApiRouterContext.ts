import { createContext } from "react";
import type { useApiWebSocket } from "./hooks/useApiWebSocket.js";

export const WebSocketApiRouterContext = createContext<ReturnType<typeof useApiWebSocket>>({
    sendMessage: async (_topic, _payload) => {},
    readyState: -1,
    apiUrls: [],
    apiUrl: "",
    setApiUrl: (_value) => {},
});
