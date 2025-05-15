<script lang="ts">
    import { telemetryStatus } from "../services/websocket-service.svelte.js";
    import type {NetworkStatus} from "../types/types";
    import {derived} from "svelte/store";

    const displayNames: Record<NetworkStatus, string> = {
        ap_ip: "Access Point MAC",
        signal_strength: "Wi-Fi Signal",
        user_mode: "Control Mode",
        back_connection: "Server Connection"
    };

    const formatValue = (key: string, value: any) => {
        if (key === "back_connection") {
            return value ? "Connected" : "Disconnected";
        } else if (key === "user_mode") {
            return value === "user" ? "User" : "Autonomous";
        }
        return value;
    };

    const telemetryEntries = $derived(Object.entries(telemetryStatus));
</script>

<div class="telemetry-bar">
    {#each telemetryEntries as [key, value]}
        <div class="telemetry-item">
            <span>{displayNames[key] || key}:</span>
            {#if key === "back_connection"}
                <div class="connection-row">
                    <div class="connection-indicator" style="background: {value ? 'green' : 'red'}"></div>
                    <div>{formatValue(key, value)}</div>
                </div>
            {:else if key === "user_mode" && value !== "user"}
                <div class="autonomous-mode blinking-red">{formatValue(key, value)}</div>
            {:else}
                <div>{formatValue(key, value)}</div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .telemetry-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        display: flex;
        justify-content: space-around;
        font-size: 1rem;
        z-index: 10;
    }

    .telemetry-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .telemetry-item span {
        font-weight: bold;
    }

    .connection-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
    }

    .connection-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin: 4px 0;
    }

    .autonomous-mode {
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 5px;
    }

    .blinking-red {
        background-color: red;
        color: white;
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 5px;
        animation: blink-bg 1s step-start infinite;
    }


    @keyframes blink-bg {
        0%, 100% {
            background-color: red;
        }
        50% {
            background-color: darkred;
        }
    }

</style>
