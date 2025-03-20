import type {WebsocketServiceSvelte} from "../services/websocket-service.svelte.js";


export abstract class BaseController {
    protected websocketService: WebsocketServiceSvelte;
    protected throttle: number = 0.0;
    protected angle: number = 0.0;

    protected throttleScaling: number = 1.0; // Multiply throttle by this factor
    protected angleScaling: number = 1.0;    // Multiply angle by this factor

    public manualControlActive = true;

    private controlUpdateCallback?: (manualControl: boolean) => void;

    protected constructor(websocketService: WebsocketServiceSvelte) {
        this.websocketService = websocketService;
        this.loadSettings();
    }

    protected loadSettings(): void {
        const stored = localStorage.getItem("smoothnessSettings");
        if (stored) {
            try {
                const settings = JSON.parse(stored);
                this.throttleScaling = settings.throttleScaling ?? 1.0;
                this.angleScaling = settings.angleScaling ?? 1.0;
            } catch (e) {
                console.error("Error parsing smoothness settings", e);
            }
        }
    }

    protected sendControlCommand(): void {
        if (!this.websocketService.isConnected) {
            return;
        }

        const payload = {
            throttle: this.throttle * this.throttleScaling,
            angle: this.angle * this.angleScaling,
        };

        console.log(payload)

        this.websocketService.send(JSON.stringify(payload));
    }

    public updateScaling({ angleScaling, throttleScaling }: { angleScaling: number; throttleScaling: number }): void {
        this.angleScaling = angleScaling;
        this.throttleScaling = throttleScaling;
    }

    public updateControl(newThrottle: number, newAngle: number): void {
        if (!this.manualControlActive && (this.throttle !== newThrottle || this.angle !== newAngle)) {
            this.manualControlActive = true;

            if (this.controlUpdateCallback) {
                this.controlUpdateCallback(this.manualControlActive);
            }
        }
        this.throttle = newThrottle;
        this.angle = newAngle;
        this.sendControlCommand();
    }

    public registerControlUpdateCallback(callback: (manualControl: boolean) => void): void {
        this.controlUpdateCallback = callback;
    }


    abstract initialize(): void;
    abstract destroy(): void;

}
