<script lang="ts">
    import { onMount } from "svelte";
    import type { ControllerManager } from "../services/controller-manager";

    export let controllerManager: ControllerManager;

    // Local scaling configuration (used to adjust control sensitivity)
    let throttleScaling: number = 1.0;
    let angleScaling: number = 1.0;

    // Load saved settings from localStorage, if available
    function loadSettings() {
        const stored = localStorage.getItem("smoothnessSettings");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                throttleScaling = parsed.throttleScaling ?? 1.0;
                angleScaling = parsed.angleScaling ?? 1.0;
            } catch (e) {
                console.error("Error parsing smoothness settings", e);
            }
        }
    }

    // Save current values to localStorage
    function saveSettings() {
        const settings = { throttleScaling, angleScaling };
        localStorage.setItem("smoothnessSettings", JSON.stringify(settings));
        console.log("Smoothness settings saved:", settings);
    }

    // Update the current controller's scaling settings.
    function updateSmoothness() {
        const controller = controllerManager.getCurrentController();
        if (controller && typeof controller.updateScaling === "function") {
            controller.updateScaling({
                angleScaling,
                throttleScaling,
            });
            console.log("Updated smoothness:", { throttleScaling, angleScaling });
        } else {
            console.error("No configurable controller available for smoothness update.");
        }
    }

    onMount(() => {
        loadSettings();
    });
</script>

<div class="smoothness-settings">
    <h3>Scaling settings</h3>
    <div class="form-group">
        <label for="throttleScaling">Throttle factor</label>
        <input
                id="throttleScaling"
                type="number"
                bind:value={throttleScaling}
                step="0.1"
                min="0" />
    </div>
    <div class="form-group">
        <label for="angleScaling">Steering factor</label>
        <input
                id="angleScaling"
                type="number"
                bind:value={angleScaling}
                step="0.1"
                min="0" />
    </div>
    <button on:click={() => { saveSettings(); updateSmoothness(); }}>
        Apply scaling
    </button>
</div>

<style>
    .smoothness-settings {
        background: #333;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem auto;
        color: #fff;
    }
    .form-group {
        margin-bottom: 1rem;
    }
    label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
    }
    input {
        padding: 0.3rem;
        font-size: 1rem;
    }
    button {
        padding: 0.5rem 1rem;
        background: #444;
        border: none;
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
    }
    button:hover {
        background: #666;
    }
</style>
