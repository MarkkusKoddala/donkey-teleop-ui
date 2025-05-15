import { BaseController } from "./base-controller";
import type { WebsocketServiceSvelte } from "../services/websocket-service.svelte.js";

/**
 * Maps arrow key input to throttle and steering commands via WebSocket.
 */
export class KeyboardController extends BaseController {
    private buttonMappings: Record<string, string>;
    // Set of currently held-down keys
    private activeKeys: Set<string>;
    private pollIntervalId: number | null = null;
    private lastInputTime = 0;

    constructor(websocketService: WebsocketServiceSvelte) {
        super(websocketService);

        this.buttonMappings = {
            accelerate: "ArrowUp",
            brake: "ArrowDown",
            left: "ArrowLeft",
            right: "ArrowRight",
            action: " ",
        };

        this.activeKeys = new Set();
    }

    initialize() {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);

        // Poll at 10 Hz
        this.pollIntervalId = window.setInterval(() => this.updateControls(), 100);

        console.log("KeyboardController initialized");
    }

    destroy() {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);

        if (this.pollIntervalId) {
            clearInterval(this.pollIntervalId);
            this.pollIntervalId = null;
        }

        console.log("KeyboardController destroyed");
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        // Ignore repeat events or already active keys
        if (event.repeat || this.activeKeys.has(event.key)) {
            return;
        }
        this.activeKeys.add(event.key);
        this.lastInputTime = performance.now();
    };

    private handleKeyUp = (event: KeyboardEvent) => {
        // Remove from the set on key up
        if (this.activeKeys.has(event.key)) {
            this.activeKeys.delete(event.key);
            this.lastInputTime = performance.now();
        }
    };

    private updateControls() {
        // If any key is held, reset idle timer
        if (this.activeKeys.size > 0) {
            this.lastInputTime = performance.now();
        }

        const now = performance.now();
        const timeSinceLastInput = now - this.lastInputTime;
        const hasTimedOut = timeSinceLastInput > 1000;

        let newThrottle: number;
        let newAngle: number;


        // Safety purpose to set all 0 if no input
        if (hasTimedOut) {
            newThrottle = 0.0;
            newAngle = 0.0;
        } else {
            newThrottle = 0.0;
            newAngle = 0.0;

            if (this.activeKeys.has(this.buttonMappings.accelerate)) {
                newThrottle += 1.0;
            }
            if (this.activeKeys.has(this.buttonMappings.brake)) {
                newThrottle -= 1.0;
            }
            if (this.activeKeys.has(this.buttonMappings.left)) {
                newAngle -= 1.0;
            }
            if (this.activeKeys.has(this.buttonMappings.right)) {
                newAngle += 1.0;
            }
        }

        this.updateControl(newThrottle, newAngle);
    }
}
