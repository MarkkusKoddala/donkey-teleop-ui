import type {WebsocketServiceSvelte} from "./websocket-service.svelte.js";
import type {ControllerManager} from "./controller-manager";


// Time (ms) without video after which autonomy is activated
const VIDEO_FRAME_LOSS_TRESHOLD_MS  = 100;

/**
 * AutonomyManager monitors video feed and user input,
 * and decides whether the system should switch to autonomy mode.
 */
export class AutonomyManager {
    private websocketService: WebsocketServiceSvelte;
    private controllerManager: ControllerManager;

    private lastFrameTimestamp: number = Date.now();
    private pollingInterval: number | null = null;

    public autonomyModeActive: boolean = false;

    // Whether video frames are actively being received
    public videoFeedActive: boolean = true;

    // Tracks if the user has pressed any key after connection
    private userInputAfterConnection: boolean = false;
    // Cached event handler reference for keydown
    private boundKeyHandler: (event: KeyboardEvent) => void;

    constructor(websocketService: WebsocketServiceSvelte, controllerManager: ControllerManager) {
        this.websocketService = websocketService;
        this.controllerManager = controllerManager;

        // Register a callback from the controller to track manual input
        if (controllerManager.activeController) {
            controllerManager.activeController.registerControlUpdateCallback((manualControl: boolean) => {
                this.controlUpdate(manualControl);
            });
        }

        this.boundKeyHandler = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.boundKeyHandler);
    }


    // Tracks first user key press after connection
    private handleKeyDown(): void {
        if (this.videoFeedActive && this.websocketService.isConnected && !this.userInputAfterConnection) {
            this.userInputAfterConnection = true;
        }
    }

    public resetUserInputFlag(): void {
        this.userInputAfterConnection = false;
    }

    // Called when manual control is detected — disables autonomy
    private controlUpdate(manualControl: boolean): void {
        if (this.videoFeedActive && manualControl) {
            this.autonomyModeActive = false;
        }
    }

    // Called whenever a video frame is received
    public updateVideoFrame(): void {
        this.lastFrameTimestamp = Date.now();
        if (!this.videoFeedActive) {
            this.videoFeedActive = true;
            this.websocketService.setVideoFeedActive(true);
        }
    }

    public startMonitoring(): void {
        if (this.pollingInterval !== null) return;
        this.pollingInterval = window.setInterval(() => {
            if (!this.websocketService.isConnected) return;
            this.checkVideoFeed();
            this.sendAutonomyCommand();
        }, 100);
    }

    public stopMonitoring(): void {
        if (this.pollingInterval !== null) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // Checks if video has timed out, and if so, activates autonomy
    private checkVideoFeed(): void {
        const now = Date.now();
        if (now - this.lastFrameTimestamp > VIDEO_FRAME_LOSS_TRESHOLD_MS) {
            this.autonomyModeActive = true;
            this.videoFeedActive = false;
            this.controllerManager.getCurrentController().manualControlActive = false;
            this.websocketService.setVideoFeedActive(false);
        }
    }

    public sendAutonomyCommand(): void {
        // If the user hasn't provided input after connection, force autonomy to false,
        // preventing unintended activation of autonomy mode after reconnection.
        const finalAutonomy = this.userInputAfterConnection ? this.autonomyModeActive : false;
        const payload = { autonomy: finalAutonomy };
        this.websocketService.send(JSON.stringify(payload));
    }
}
