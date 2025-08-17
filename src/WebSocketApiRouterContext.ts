import { createContext } from "react";
import { ReadyState } from "react-use-websocket";
import type { useApiWebSocket } from "./hooks/useApiWebSocket.js";
import { API_URLS } from "./store.js";

export const WebSocketApiRouterContext = createContext<ReturnType<typeof useApiWebSocket>>({
    sendMessage: async (_sourceIdx, _topic, _payload) => {},
    transactionPrefixes: API_URLS.map(() => ""),
    readyStates: API_URLS.map(() => ReadyState.UNINSTANTIATED),
});
