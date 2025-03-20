import type { NetworkStatus } from "../types/types";

// Shared reactive telemetry state
export const telemetryStatus = $state<NetworkStatus>({
    ap_ip: "",
    signal_strength: 0,
    user_mode: "",
    back_connection: false,
});


/**
 * WebSocketServiceSvelte manages a persistent WebSocket connection
 * for control, telemetry, or video feeds. It includes reconnection logic
 * and optional message and connection event handlers.
 */
export class WebsocketServiceSvelte {
    private socket: WebSocket | null = null;
    public isConnected = false;
    private readonly url: string;
    private readonly handleMessage: (data: Blob | never) => void;
    private reconnectInterval = 2000;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    private telemetryDefaults: NetworkStatus = {
        ap_ip: "",
        signal_strength: 0,
        user_mode: "",
        back_connection: false,
    };

    private readonly onOpenCallback?: () => void;

    private videoFeedActive = false;

    constructor(url: string, handleMessage: (data: Blob | never) => void, onOpenCallback?: () => void) {
        this.url = url;
        this.handleMessage = handleMessage;
        this.onOpenCallback = onOpenCallback;
    }

    connect(): void {
        if (this.isConnected) {
            console.warn("WebSocket is already connected.");
            return;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("WebSocket connected");
            this.isConnected = true;
            if (this.onOpenCallback) {
                this.onOpenCallback();
            }
        };

        this.socket.onmessage = (event: MessageEvent) => {
            if (event.data instanceof Blob) {
                this.handleMessage(event.data);
            } else if (typeof event.data === "string") {
                try {
                    const message = JSON.parse(event.data);
                    this.updateTelemetry(message);
                } catch (error) {
                    console.error("Error parsing JSON message:", error);
                }
            }
        };

        this.socket.onclose = (event: CloseEvent) => {
            console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
            this.isConnected = false;
            this.resetTelemetry();
            this.attemptReconnect();
        };

        this.socket.onerror = (event: Event) => {
            console.error("WebSocket error:", event);
            this.isConnected = false;
            this.resetTelemetry();
            this.attemptReconnect();
        };
    }

    public setVideoFeedActive(active: boolean): void {
        this.videoFeedActive = active;
    }


    private attemptReconnect(): void {
        if (!this.reconnectTimeout) {
            console.log(`Attempting to reconnect...`);
            this.reconnectTimeout = setTimeout(() => {
                this.reconnectTimeout = null;
                this.connect();
            }, this.reconnectInterval);
        }
    }

    send(command: string): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(command);
        } else {
            console.warn("WebSocket is not connected.");
        }
    }

    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
            this.resetTelemetry();
        }
    }

    private updateTelemetry(message: any): void {
        telemetryStatus.ap_ip = message.ap_mac; // not ap_ip!
        telemetryStatus.signal_strength = message.signal_strength;
        telemetryStatus.user_mode = message.user_mode;
        telemetryStatus.back_connection = message.back_connection;
    }

    private resetTelemetry(): void {
        telemetryStatus.ap_ip = this.telemetryDefaults.ap_ip;
        telemetryStatus.signal_strength = this.telemetryDefaults.signal_strength;
        telemetryStatus.user_mode = this.telemetryDefaults.user_mode;
        telemetryStatus.back_connection = this.telemetryDefaults.back_connection;
    }
}
