import { BaseController } from "./base-controller";


const DEAD_ZONE_THRESHOLD: number = 0.1;

/**
 * Handles input from Logitech/Xbox-style gamepads and maps it to
 * throttle and steering commands sent via WebSocket.
 */
export class LogitechGamepadController extends BaseController {
    private gamepadIndex: number | null = null;
    private pollingInterval: number | null = null;

    constructor(webSocketService) {
        super(webSocketService);
    }

    initialize(): void {
        this.checkExistingGamepads();
        window.addEventListener("gamepadconnected", this.handleGamepadConnected);
        window.addEventListener("gamepaddisconnected", this.handleGamepadDisconnected);
        console.log("LogitechGamepadController initialized");
    }

    destroy(): void {
        window.removeEventListener("gamepadconnected", this.handleGamepadConnected);
        window.removeEventListener("gamepaddisconnected", this.handleGamepadDisconnected);
        this.stopPolling();
        console.log("LogitechGamepadController destroyed");
    }


    private checkExistingGamepads(): void {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
            if (gamepad && gamepad.id.toLowerCase().includes("xbox")) {
                console.log(`Logitech gamepad already connected: ${gamepad.id}`);
                this.gamepadIndex = gamepad.index;
                this.startPolling();
                return;
            }
        }
        console.log("No Logitech gamepad currently connected");
    }

    private handleGamepadConnected = (event: GamepadEvent): void => {
        const gamepad = event.gamepad;

        if (gamepad.id.toLowerCase().includes("xbox")) {
            console.log(`Logitech gamepad connected: ${gamepad.id}`);
            this.gamepadIndex = gamepad.index;
            this.startPolling();
        }
    };

    private handleGamepadDisconnected = (event: GamepadEvent): void => {
        if (this.gamepadIndex === event.gamepad.index) {
            console.log(`Logitech gamepad disconnected: ${event.gamepad.id}`);
            this.stopPolling();
            this.gamepadIndex = null;
        }
    };

    private startPolling(): void {
        if (this.pollingInterval !== null) return;

        console.log("Starting gamepad polling...");
        this.pollingInterval = window.setInterval(() => this.pollGamepad(), 100); // Poll every 100ms
    }

    private stopPolling(): void {
        if (this.pollingInterval !== null) {
            console.log("Stopping gamepad polling...");
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    private computeSmoothThrottle(rtValue: number, ltValue: number): number {
        const forward = rtValue > DEAD_ZONE_THRESHOLD ? rtValue : 0;
        const reverse = ltValue > DEAD_ZONE_THRESHOLD ? -ltValue : 0;
        return forward + reverse;
    }

    private pollGamepad(): void {
        if (this.gamepadIndex === null) return;
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (!gamepad) return;

        const rtValue = gamepad.buttons[7].value;
        const ltValue = gamepad.buttons[6].value;

        const newThrottle = this.computeSmoothThrottle(rtValue, ltValue);

        const leftStickX = gamepad.axes[2];
        const newAngle = Math.abs(leftStickX) > DEAD_ZONE_THRESHOLD ? leftStickX : 0;

        // Process other buttons (ignoring triggers as they've been handled).
        gamepad.buttons.forEach((button, index) => {
            if (index !== 6 && index !== 7 && button.pressed) {
                this.handleButtonPress(index, button.value);
            }
        });

        this.updateControl(newThrottle, newAngle);
    }

    private handleButtonPress(buttonIndex: number, value: number): void {
        console.log(`Button ${buttonIndex} pressed with value ${value}`);
    }

}
