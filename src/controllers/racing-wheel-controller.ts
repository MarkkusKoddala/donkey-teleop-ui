import { BaseController } from "./base-controller";

const DEAD_ZONE_THRESHOLD = 0.05;
const ACCELERATOR_AXIS = 2;
const BRAKE_AXIS = 3;
const STEERING_AXIS = 0;

/**
 * Maps Logitech G29/G920 racing wheel input to throttle and steering,
 * sending commands via WebSocket.
 */

export class RacingWheelController extends BaseController {
    private gamepadIndex: number | null = null;
    private pollingInterval: number | null = null;

    constructor(webSocketService: any) {
        super(webSocketService);
    }

    initialize(): void {
        this.checkExistingGamepads();
        window.addEventListener("gamepadconnected", this.handleGamepadConnected);
        window.addEventListener("gamepaddisconnected", this.handleGamepadDisconnected);
    }

    destroy(): void {
        window.removeEventListener("gamepadconnected", this.handleGamepadConnected);
        window.removeEventListener("gamepaddisconnected", this.handleGamepadDisconnected);
        if (this.pollingInterval !== null) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    private checkExistingGamepads(): void {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
            if (gamepad && (gamepad.id.toLowerCase().includes("g29") || gamepad.id.toLowerCase().includes("g920"))) {
                console.log(`Controller already connected: ${gamepad.id}`);
                this.gamepadIndex = gamepad.index;
                this.startPolling();
                return;
            }
        }
    }

    private handleGamepadConnected = (event: GamepadEvent): void => {
        const gamepad = event.gamepad;
        if (gamepad.id.toLowerCase().includes("g29") || gamepad.id.toLowerCase().includes("g920")) {
            console.log(`Controller connected: ${gamepad.id}`);
            this.gamepadIndex = gamepad.index;
            this.startPolling();
        }
    };

    private handleGamepadDisconnected = (event: GamepadEvent): void => {
        if (this.gamepadIndex === event.gamepad.index) {
            console.log(`Controller disconnected: ${event.gamepad.id}`);
            this.stopPolling();
            this.gamepadIndex = null;
        }
    };

    private startPolling(): void {
        if (this.pollingInterval !== null) return;
        console.log("Starting polling for Logitech G29/G920 Controller...");
        this.pollingInterval = window.setInterval(() => this.pollGamepad(), 100); // Poll at 10 Hz
    }

    private stopPolling(): void {
        if (this.pollingInterval !== null) {
            console.log("Stopping polling for Logitech G29/G920 Controller...");
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    private pollGamepad(): void {
        if (this.gamepadIndex === null) return;
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (!gamepad) return;

        // Retrieve accelerator and brake pedal values.
        // Depending on your hardware/driver, these axes might be inverted.
        const accelerator = gamepad.axes[ACCELERATOR_AXIS] || 0;
        const brake = gamepad.axes[BRAKE_AXIS] || 0;
        // For a racing wheel, you might define throttle as accelerator minus brake.
        this.throttle = accelerator - brake;

        // Retrieve steering value.
        const steeringValue = gamepad.axes[STEERING_AXIS] || 0;
        this.angle = Math.abs(steeringValue) > DEAD_ZONE_THRESHOLD ? steeringValue : 0;

        this.sendControlCommand();
    }
}
