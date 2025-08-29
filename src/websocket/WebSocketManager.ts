import store2 from "store2";
import type { Zigbee2MQTTAPI, Zigbee2MQTTRequestEndpoints, Zigbee2MQTTResponse } from "zigbee2mqtt";
import { AVAILABILITY_FEATURE_TOPIC_ENDING } from "../consts.js";
import { USE_PROXY } from "../envs.js";
import { AUTH_FLAG_KEY, AUTH_TOKEN_KEY } from "../localStoreConsts.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { LogMessage, Message, RecursiveMutable, ResponseMessage } from "../types.js";
import { randomString, stringifyWithUndefinedAsNull } from "../utils.js";

// prevent stripping
const USE_PROXY_BOOL = /(yes|true|1)/.test(USE_PROXY);
const UNAUTHORIZED_ERROR_CODE = 4401;
const RECONNECT_INTERVAL_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
const BATCH_IMMEDIATE_THRESHOLD = 500;
const REQUEST_TIMEOUT_MS = 20000;
const WS_MANAGER_GLOBAL_KEY = "__WINDFRONT_WS_MANAGER__";

type PendingRequest = {
    resolve: () => void;
    reject: (reason: unknown) => void;
    timeoutId: number;
};

type Connection = {
    idx: number;
    socket: WebSocket | undefined;
    attempts: number;
    reconnectTimer: number | undefined;
    transactionPrefix: string;
    transactionNumber: number;
    pending: Map<string, PendingRequest>;
    deviceQueue: Message<Zigbee2MQTTAPI["{friendlyName}"]>[];
    logQueue: LogMessage[];

    // batched metrics (delta since last commit)
    metricsMessagesSent: number;
    metricsBytesSent: number;
    metricsMessagesReceived: number;
    metricsMessagesBridge: number;
    metricsMessagesDevice: number;
    metricsBytesReceived: number;
    metricsReconnects: number;
    /** 0 means unchanged */
    metricsLastMessageTs: number;
    dirtyMetrics: boolean;
};

class WebSocketManager {
    #connections: Connection[] = [];
    #rafHandle: number | undefined;
    #destroyed = false;
    #shuttingDown = false;

    constructor() {
        for (let i = 0; i < API_URLS.length; i++) {
            this.#connections.push({
                idx: i,
                socket: undefined,
                attempts: 0,
                reconnectTimer: undefined,
                transactionPrefix: randomString(5),
                transactionNumber: 1,
                pending: new Map(),
                deviceQueue: [],
                logQueue: [],
                metricsMessagesSent: 0,
                metricsBytesSent: 0,
                metricsMessagesReceived: 0,
                metricsMessagesBridge: 0,
                metricsMessagesDevice: 0,
                metricsBytesReceived: 0,
                metricsReconnects: 0,
                metricsLastMessageTs: 0,
                dirtyMetrics: false,
            });
        }

        window.addEventListener("beforeunload", () => {
            this.#prepareUnload();
        });

        window.addEventListener("pagehide", () => {
            this.#prepareUnload();
        });
    }

    start(): void {
        if (this.#shuttingDown) {
            return;
        }

        for (const conn of this.#connections) {
            this.#open(conn);
        }
    }

    destroy(reason?: string): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#shuttingDown = true;

        if (this.#rafHandle !== undefined) {
            cancelAnimationFrame(this.#rafHandle);

            this.#rafHandle = undefined;
        }

        this.#flush(true);

        for (const conn of this.#connections) {
            if (conn.reconnectTimer !== undefined) {
                clearTimeout(conn.reconnectTimer);

                conn.reconnectTimer = undefined;
            }

            if (conn.socket) {
                try {
                    conn.socket.close(4000, reason);
                } catch {
                    /* ignore */
                }

                conn.socket = undefined;
            }

            for (const [, p] of conn.pending) {
                clearTimeout(p.timeoutId);
                p.reject(new Error("WebSocket manager destroyed"));
            }

            conn.pending.clear();
            useAppStore.getState().setPendingRequestsCount(conn.idx, 0);
        }
    }

    #prepareUnload(): void {
        if (this.#destroyed || this.#shuttingDown) {
            return;
        }

        this.#shuttingDown = true;

        if (this.#rafHandle !== undefined) {
            cancelAnimationFrame(this.#rafHandle);

            this.#rafHandle = undefined;
        }

        this.#flush(true);

        for (const conn of this.#connections) {
            if (conn.reconnectTimer !== undefined) {
                clearTimeout(conn.reconnectTimer);

                conn.reconnectTimer = undefined;
            }

            if (conn.socket) {
                try {
                    conn.socket.close(4001, "page-unload");
                } catch {
                    /* ignore */
                }
            }
        }
    }

    getTransactionPrefix(idx: number): string {
        return this.#connections[idx].transactionPrefix;
    }

    async sendMessage<T extends Zigbee2MQTTRequestEndpoints>(sourceIdx: number, topic: T, payload: Zigbee2MQTTAPI[T]): Promise<void> {
        if (this.#destroyed) {
            return;
        }

        const conn = this.#connections[sourceIdx];

        if (!conn) {
            console.error(`Unknown source index ${sourceIdx}`);

            return;
        }

        if (!conn.socket || conn.socket.readyState !== WebSocket.OPEN) {
            const msg = "Cannot send, WebSocket not open";
            const store = useAppStore.getState();

            store.addToast({ sourceIdx, topic, status: "error", error: msg });

            return;
        }

        if (topic.startsWith("bridge/request/")) {
            if (payload !== "" && typeof payload === "string") {
                console.error("Only `Record<string, unknown>` or empty string payloads allowed");

                return;
            }

            const transaction = `${conn.transactionPrefix}-${conn.transactionNumber++}`;
            const finalPayload = stringifyWithUndefinedAsNull({
                topic,
                payload: payload === "" ? { transaction } : { ...payload, transaction },
            });

            try {
                await this.#enqueueBridgeRequest(sourceIdx, conn, transaction, finalPayload);
            } catch (error) {
                console.error(`Failed bridge API call (${API_NAMES[sourceIdx]} | ${sourceIdx})`, error.message, error.cause);
            }

            return;
        }

        try {
            const finalPayload = stringifyWithUndefinedAsNull({ topic, payload });

            console.log(`Calling API (${API_NAMES[sourceIdx]} | ${sourceIdx}):`, finalPayload);
            this.#queueAddLog(conn, {
                level: "debug",
                message: `frontend:api: Sending ${finalPayload}`,
                namespace: "frontend:api",
            });
            conn.socket.send(finalPayload);

            conn.metricsMessagesSent++;
            conn.metricsBytesSent += finalPayload.length;
            conn.dirtyMetrics = true;

            this.#scheduleFlush();
        } catch (error) {
            console.error(`Failed API call (${API_NAMES[sourceIdx]} | ${sourceIdx})`, error);
        }
    }

    #buildUrl(idx: number): string | undefined {
        const raw = API_URLS[idx];
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        let url = new URL(`${protocol}://${raw}`);

        // VITE_ first (stripped accordingly during build)
        if (url.hostname !== "localhost" && (import.meta.env.VITE_USE_PROXY === "true" || USE_PROXY_BOOL)) {
            const hostPath = url.host + (url.pathname !== "/" ? url.pathname : "");
            url = new URL(
                `${protocol}://${window.location.host}${window.location.pathname}${window.location.pathname.endsWith("/") ? "" : "/"}ws-proxy/${hostPath}`,
            );
        }

        const authRequired = !!store2.get(`${AUTH_FLAG_KEY}_${idx}`);

        if (authRequired) {
            const token = new URLSearchParams(window.location.search).get("token") ?? (store2.get(`${AUTH_TOKEN_KEY}_${idx}`) as string | undefined);

            if (!token) {
                // trigger LoginPage
                useAppStore.getState().setAuthRequired(idx, true);

                return;
            }

            url.searchParams.append("token", token);
        }

        return url.toString();
    }

    #open(conn: Connection): void {
        if (this.#destroyed || this.#shuttingDown || conn.socket) {
            return;
        }

        const finalUrl = this.#buildUrl(conn.idx);

        if (!finalUrl) {
            // required auth token missing, LoginPage will take over for this conn
            return;
        }

        try {
            conn.socket = new WebSocket(finalUrl);

            useAppStore.getState().setReadyState(conn.idx, conn.socket?.readyState ?? WebSocket.CONNECTING);
            conn.socket.addEventListener("open", () => this.#onOpen(conn));
            conn.socket.addEventListener("message", (e) => this.#onMessage(conn, e));
            conn.socket.addEventListener("close", (e) => this.#onClose(conn, e));
            conn.socket.addEventListener("error", () => this.#onError(conn));
        } catch (error) {
            console.error("Failed to create WebSocket", error);

            this.#scheduleReconnect(conn);
        }
    }

    #onOpen(conn: Connection): void {
        if (this.#destroyed || this.#shuttingDown) {
            return;
        }

        conn.attempts = 0;

        useAppStore.getState().setReadyState(conn.idx, conn.socket?.readyState ?? WebSocket.OPEN);
        console.log("WebSocket opened", conn);
    }

    #onClose(conn: Connection, event: CloseEvent): void {
        if (this.#destroyed) {
            return;
        }

        useAppStore.getState().setReadyState(conn.idx, conn.socket?.readyState ?? WebSocket.CLOSED);
        console.log("WebSocket closed", conn, event);

        const unauthorized = event.code === UNAUTHORIZED_ERROR_CODE;

        if (unauthorized) {
            store2.set(`${AUTH_FLAG_KEY}_${conn.idx}`, true);
            store2.remove(`${AUTH_TOKEN_KEY}_${conn.idx}`);
            useAppStore.getState().setAuthRequired(conn.idx, true);
        }

        for (const [, p] of conn.pending) {
            clearTimeout(p.timeoutId);
            p.reject(new Error("WebSocket closed"));
        }

        conn.pending.clear();
        useAppStore.getState().setPendingRequestsCount(conn.idx, 0);

        if (!unauthorized) {
            this.#scheduleReconnect(conn);
        } else {
            // LoginPage handles reconnect here, so, allow `#open` to trigger again for this conn
            conn.socket = undefined;
        }
    }

    #onError(conn: Connection): void {
        if (this.#destroyed || this.#shuttingDown) {
            return;
        }

        console.log("WebSocket error", conn);
        this.#queueAddLog(conn, {
            // don't want this to spam toasts with some browsers closing WS on focus loss (should reconnect fine)
            level: "debug",
            message: "frontend:ws: Failed to connect to WebSocket",
            namespace: "frontend:ws",
        });
    }

    #scheduleReconnect(conn: Connection): void {
        if (this.#destroyed || this.#shuttingDown) {
            return;
        }

        if (conn.attempts >= MAX_RECONNECT_ATTEMPTS) {
            this.#queueAddLog(conn, {
                level: "error",
                message: `frontend:ws: Failed to connect to WebSocket after ${conn.attempts} tries`,
                namespace: "frontend:ws",
            });

            return;
        }

        if (conn.reconnectTimer !== undefined) {
            return;
        }

        this.#scheduleFlush();

        conn.reconnectTimer = window.setTimeout(() => {
            conn.reconnectTimer = undefined;

            if (this.#destroyed || this.#shuttingDown) {
                return;
            }

            if (conn.socket) {
                try {
                    conn.socket.close();
                } catch {
                    /* ignored */
                }

                conn.socket = undefined;
            }

            conn.attempts++;
            conn.metricsReconnects++;
            conn.dirtyMetrics = true;

            console.log("WebSocket reconnect", conn);
            // this toast is crafted to show specific info, does not follow usual "response-derived" pattern
            useAppStore.getState().addToast({
                sourceIdx: conn.idx,
                topic: "WebSocket",
                status: "ok",
                error: "Reconnecting...",
            });
            this.#open(conn);
        }, RECONNECT_INTERVAL_MS);
    }

    #enqueueBridgeRequest(sourceIdx: number, conn: Connection, transaction: string, payload: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.#destroyed || this.#shuttingDown) {
                return reject(new Error("WebSocket manager destroyed/shutting down"));
            }

            if (!conn.socket || conn.socket.readyState !== WebSocket.OPEN) {
                return reject(new Error("WebSocket not open"));
            }

            const timeoutId = window.setTimeout(() => {
                const pending = conn.pending.get(transaction);

                if (pending) {
                    conn.pending.delete(transaction);
                    useAppStore.getState().setPendingRequestsCount(sourceIdx, conn.pending.size);
                    pending.reject(new Error("Request timed out", { cause: transaction }));
                }
            }, REQUEST_TIMEOUT_MS);

            conn.pending.set(transaction, { resolve, reject, timeoutId });
            useAppStore.getState().setPendingRequestsCount(sourceIdx, conn.pending.size);

            try {
                console.log(`Calling bridge API (${API_NAMES[sourceIdx]} | ${sourceIdx}):`, payload);
                this.#queueAddLog(conn, {
                    level: "debug",
                    message: `frontend:api:bridge: Sending ${payload}`,
                    namespace: "frontend:api:bridge",
                });
                conn.socket.send(payload);

                conn.metricsMessagesSent++;
                conn.metricsBytesSent += payload.length;
                conn.dirtyMetrics = true;

                this.#scheduleFlush();
            } catch (error) {
                clearTimeout(timeoutId);
                conn.pending.delete(transaction);
                useAppStore.getState().setPendingRequestsCount(sourceIdx, conn.pending.size);
                reject(error);
            }
        });
    }

    #onMessage(conn: Connection, event: MessageEvent): void {
        if (this.#destroyed || this.#shuttingDown) {
            return;
        }

        if (typeof event.data !== "string") {
            return;
        }

        const raw = event.data;
        let parsed: Message;

        try {
            parsed = JSON.parse(raw) as Message;
        } catch (error) {
            this.#queueAddLog(conn, {
                level: "error",
                message: `frontend:ws: parse error ${(error as Error).message}`,
                namespace: "frontend:ws",
            });

            return;
        }

        conn.metricsMessagesReceived++;
        conn.metricsBytesReceived += raw.length;
        conn.metricsLastMessageTs = Date.now();
        conn.dirtyMetrics = true;

        if (parsed.topic.endsWith(AVAILABILITY_FEATURE_TOPIC_ENDING)) {
            useAppStore.getState().updateAvailability(conn.idx, parsed as Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>);
            this.#scheduleFlush(); // ensure metrics commit

            return;
        }

        if (parsed.topic.startsWith("bridge/")) {
            this.#handleBridge(conn, parsed);

            conn.metricsMessagesBridge++;

            this.#scheduleFlush(); // ensure metrics commit

            return;
        }

        conn.metricsMessagesDevice++;

        // this.#scheduleFlush() called inside
        this.#queueUpdateDeviceState(conn, parsed as Message<Zigbee2MQTTAPI["{friendlyName}"]>);
    }

    #handleBridge(conn: Connection, msg: Message): void {
        const store = useAppStore.getState();

        switch (msg.topic) {
            case "bridge/info": {
                store.setBridgeInfo(conn.idx, msg.payload as Zigbee2MQTTAPI[typeof msg.topic]);

                break;
            }
            case "bridge/state": {
                store.setBridgeState(conn.idx, msg.payload as Zigbee2MQTTAPI[typeof msg.topic]);

                break;
            }
            case "bridge/health": {
                store.setBridgeHealth(conn.idx, msg.payload as Zigbee2MQTTAPI[typeof msg.topic]);

                break;
            }
            case "bridge/definitions": {
                store.setBridgeDefinitions(conn.idx, msg.payload as RecursiveMutable<Zigbee2MQTTAPI[typeof msg.topic]>);

                break;
            }
            case "bridge/devices": {
                store.setDevices(conn.idx, msg.payload as unknown as Zigbee2MQTTAPI[typeof msg.topic]);

                break;
            }
            case "bridge/groups": {
                store.setGroups(conn.idx, msg.payload as unknown as Zigbee2MQTTAPI[typeof msg.topic]);

                break;
            }
            case "bridge/converters": {
                store.setConverters(conn.idx, msg.payload as Zigbee2MQTTAPI[typeof msg.topic]);

                break;
            }
            case "bridge/extensions": {
                store.setExtensions(conn.idx, msg.payload as Zigbee2MQTTAPI[typeof msg.topic]);

                break;
            }
            case "bridge/logging": {
                const log = msg.payload as Zigbee2MQTTAPI[typeof msg.topic];

                this.#queueAddLog(conn, log);

                break;
            }
            case "bridge/response/networkmap": {
                const response = msg.payload as Zigbee2MQTTResponse<typeof msg.topic>;

                store.setNetworkMap(conn.idx, response.status === "ok" ? response.data : undefined);

                break;
            }
            case "bridge/response/touchlink/scan": {
                const { status, data: payloadData } = msg.payload as Zigbee2MQTTResponse<typeof msg.topic>;

                store.setTouchlinkScan(
                    conn.idx,
                    status === "ok" ? { inProgress: false, devices: payloadData.found } : { inProgress: false, devices: [] },
                );

                break;
            }
            case "bridge/response/touchlink/identify": {
                store.setTouchlinkIdentifyInProgress(conn.idx, false);

                break;
            }
            case "bridge/response/touchlink/factory_reset": {
                store.setTouchlinkResetInProgress(conn.idx, false);

                break;
            }
            case "bridge/response/backup": {
                const backupData = msg.payload as Zigbee2MQTTResponse<typeof msg.topic>;

                store.setBackup(conn.idx, backupData.data.zip);

                break;
            }
            case "bridge/response/device/generate_external_definition": {
                const extDef = msg.payload as Zigbee2MQTTResponse<typeof msg.topic>;

                if (extDef.status === "ok") {
                    store.addGeneratedExternalDefinition(conn.idx, extDef.data);
                }

                break;
            }
        }

        if (msg.topic.startsWith("bridge/response/")) {
            // biome-ignore lint/suspicious/noExplicitAny: generic
            this.#handleResponse(conn, msg as unknown as ResponseMessage<any>);
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: generic
    #handleResponse(conn: Connection, msg: ResponseMessage<any>): void {
        const store = useAppStore.getState();
        const payload = msg.payload;
        const transaction = payload.transaction;

        if (transaction) {
            const pending = conn.pending.get(transaction);

            if (pending) {
                clearTimeout(pending.timeoutId);

                if (payload.status === "ok" || payload.status == null) {
                    pending.resolve();
                } else {
                    pending.reject(new Error(payload.error ?? "Unknown error", { cause: transaction }));
                }

                conn.pending.delete(transaction);
                store.setPendingRequestsCount(conn.idx, conn.pending.size);
            }
        }

        store.addToast({
            sourceIdx: conn.idx,
            topic: msg.topic.replace("bridge/response/", ""),
            status: payload.status,
            error: "error" in payload ? payload.error : undefined,
            transaction: transaction,
        });
    }

    #queueUpdateDeviceState(conn: Connection, msg: Message<Zigbee2MQTTAPI["{friendlyName}"]>) {
        conn.deviceQueue.push(msg);

        if (conn.deviceQueue.length >= BATCH_IMMEDIATE_THRESHOLD) {
            queueMicrotask(() => this.#flush());
        } else {
            this.#scheduleFlush();
        }
    }

    #queueAddLog(conn: Connection, log: Zigbee2MQTTAPI["bridge/logging"]) {
        conn.logQueue.push({ ...log, timestamp: new Date().toLocaleString() });

        if (conn.logQueue.length >= BATCH_IMMEDIATE_THRESHOLD) {
            queueMicrotask(() => this.#flush());
        } else {
            this.#scheduleFlush();
        }
    }

    #scheduleFlush(): void {
        if (this.#rafHandle !== undefined) {
            return;
        }

        this.#rafHandle = requestAnimationFrame(() => {
            this.#rafHandle = undefined;
            this.#flush();
        });
    }

    #flush(force = false): void {
        if (this.#destroyed && !force) {
            return;
        }

        const store = useAppStore.getState();

        for (const conn of this.#connections) {
            if (conn.deviceQueue.length) {
                const batch = conn.deviceQueue.splice(0);

                store.updateDeviceStates(conn.idx, batch);
            }

            if (conn.logQueue.length) {
                const batch = conn.logQueue.splice(0);

                store.addLogs(conn.idx, batch);
            }

            if (!conn.dirtyMetrics) {
                continue;
            }

            store.updateWebSocketMetrics(conn.idx, {
                messagesSent: conn.metricsMessagesSent,
                bytesSent: conn.metricsBytesSent,
                messagesReceived: conn.metricsMessagesReceived,
                messagesBridge: conn.metricsMessagesBridge,
                messagesDevice: conn.metricsMessagesDevice,
                bytesReceived: conn.metricsBytesReceived,
                reconnects: conn.metricsReconnects,
                lastMessageTs: conn.metricsLastMessageTs,
            });

            conn.metricsMessagesSent = 0;
            conn.metricsBytesSent = 0;
            conn.metricsMessagesReceived = 0;
            conn.metricsMessagesBridge = 0;
            conn.metricsMessagesDevice = 0;
            conn.metricsBytesReceived = 0;
            conn.metricsReconnects = 0;
            conn.metricsLastMessageTs = 0;
            conn.dirtyMetrics = false;
        }
    }
}

//-- Global / HMR-safe singleton handling
let manager: WebSocketManager;

// in globalThis so it survives HMR
const existing = globalThis[WS_MANAGER_GLOBAL_KEY] as WebSocketManager | undefined;

if (existing) {
    manager = existing;
} else {
    manager = new WebSocketManager();
    globalThis[WS_MANAGER_GLOBAL_KEY] = manager;
}

if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        // clean manager on next hmr
        console.log("WebSocketManager hmr");
        manager.destroy("hmr");

        delete globalThis[WS_MANAGER_GLOBAL_KEY];
    });
}

export function startWebSocketManager(): void {
    manager.start();
}

export async function sendMessage<T extends Zigbee2MQTTRequestEndpoints>(sourceIdx: number, topic: T, payload: Zigbee2MQTTAPI[T]): Promise<void> {
    await manager.sendMessage(sourceIdx, topic, payload);
}

export function getTransactionPrefix(sourceIdx: number): string {
    return manager.getTransactionPrefix(sourceIdx);
}
