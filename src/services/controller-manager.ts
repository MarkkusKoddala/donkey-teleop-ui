import type { BaseController } from "../controllers/base-controller";
import type { WebsocketServiceSvelte } from "./websocket-service.svelte.js";
import { KeyboardController } from "../controllers/keyboard-controller";
import { LogitechGamepadController } from "../controllers/logitech-gamepad-controller";
import {ControllerType} from "../controllers/utils";


/**
 * ControllerManager manages all available input controllers
 * (e.g., keyboard, gamepad) and handles switching between them.
 */
export class ControllerManager {
    private activeController: BaseController;
    private readonly controllers: Map<ControllerType, BaseController>;

    constructor(websocketService: WebsocketServiceSvelte) {
        this.controllers = new Map<ControllerType, BaseController>([
            [ControllerType.KEYBOARD, new KeyboardController(websocketService)],
            [ControllerType.LOGITECH, new LogitechGamepadController(websocketService)],
        ]);

        this.activeController = this.controllers.get(ControllerType.KEYBOARD);
        this.activeController.initialize();
        console.log(`Initialized default controller: ${ControllerType.KEYBOARD}`);
    }


    switchController(type: ControllerType): void {
        const newController = this.controllers.get(type);

        if (newController) {
            this.activeController.destroy();
            this.activeController = newController;
            this.activeController.initialize();
            console.log(`Switched to ${type} type controller.`);
        } else {
            console.warn(`Controller "${type}" not found. Falling back to default.`);
            this.switchController(ControllerType.KEYBOARD);
        }
    }

    getCurrentController(): BaseController {
        return this.activeController;
    }
}
