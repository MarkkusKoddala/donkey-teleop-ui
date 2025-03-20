<script lang="ts">
    import { onMount } from "svelte";
    import ControllerSelector from "./controller-selector.svelte";
    import { ControllerType } from "../controllers/utils";
    import {getRecording, toggleRecording} from "../services/vehicle-api";
    import SmoothnessSettings from "./smoothness-settings.svelte";
    import {derived} from "svelte/store";

    let {showMenu = false, controllerManager, autonomy, updateAutonomy} = $props();


    let selectedController: ControllerType = $state(ControllerType.KEYBOARD); // Default controller

    let recording: boolean = $state(false);
    let recError: string = $state("");

    const explanation = $derived(getExplanation(selectedController));

    function getExplanation(controller: ControllerType): string {
        switch (controller) {
            case ControllerType.KEYBOARD:
                return "Keyboard Controls: Use arrow keys to control the vehicle.";
            case ControllerType.LOGITECH:
                return "Controller Info: RT - Acceleration, LT - Reverse, Left Joystick - Steering.";
            case ControllerType.RALLY_CHAIR:
                return "Rally Chair Controls: RT - Acceleration, LT - Reverse, Left Joystick - Steering.";
            default:
                return "Select a controller to see its control scheme.";
        }
    }

    function handleSelectController(controller: ControllerType) {
        controllerManager.switchController(controller);
        selectedController = controller;
    }

    async function fetchRecordingState() {
        try {
            const recData = await getRecording();
            recording = recData.recording;
        } catch (error) {
            recError = error.message;
        }
    }

    async function handleToggleRecording() {
        try {
            const data = await toggleRecording();
            recording = data.recording;
        } catch (error) {
            recError = error.message;
        }
    }

    onMount(async () => {
        await fetchRecordingState();
    });

</script>

<div class="menu-wrapper {showMenu ? 'visible' : ''}">
    <div class="menu">
        <h2>Settings</h2>

        <ControllerSelector {selectedController} onSelect={handleSelectController} />

        <p class="explanation">{explanation}</p>

        <div class="state-controls">
            <div class="state-block">
                <p>Recording: {recording ? "ON" : "OFF"}</p>
                <button class="primary" onclick={handleToggleRecording}>Toggle recording</button>
                {#if recError}
                    <p class="error">{recError}</p>
                {/if}
            </div>

            <div class="state-block">
                <p>Autonomous Mode: {autonomy ? "ON" : "OFF"}</p>
                <button class="primary" onclick={() => updateAutonomy(!autonomy)}>Toggle autonomy</button>
            </div>
        </div>
        <SmoothnessSettings {controllerManager} />

    </div>
</div>

<style>
    .menu-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        display: none;
        z-index: 100;
    }
    .menu-wrapper.visible {
        display: block;
    }
    .menu {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
    }
    .explanation {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #ccc;
    }
    .state-controls {
        margin-top: 2rem;
        display: flex;
        justify-content: space-around;
    }
    .state-block {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    button {
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
        cursor: pointer;
    }
    .error {
        color: #f88;
        font-size: 0.8rem;
    }
</style>
