<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { WebsocketServiceSvelte } from "../services/websocket-service.svelte.js";
	import { ControllerManager } from "../services/controller-manager";
	import TelemetryBar from "../components/telemetry-bar.svelte";
	import Menu from "../components/settings.svelte";
	import CameraFeed from "../components/camera-feed.svelte";
	import '../assets/style.css';
	import { PUBLIC_CAR_IP } from '$env/static/public';
	import {AutonomyManager} from "../services/autonomy-manager";
	import {getAutonomy, setAutonomy} from "../services/vehicle-api";

	let controlService: WebsocketServiceSvelte;
	let videoService: WebsocketServiceSvelte;
	let telemetryService: WebsocketServiceSvelte;
	let autonomyModeService: WebsocketServiceSvelte
	let autonomyManager: AutonomyManager;
	let previousAutonomyValue = false;


	let cameraFeed: string | null = $state(null);
	let controllerManager: ControllerManager = $state(null);
	let showMenu: boolean = $state(false);
	let autonomy: boolean = $state(false);

	function handleCameraFrame(data: Blob): void {
		cameraFeed = URL.createObjectURL(data);
		autonomyManager.updateVideoFrame();
	}


	async function updateAutonomy(value: boolean) {
		try {
			const data = await setAutonomy(value);
			autonomy = data.autonomy;
		} catch (error) {
			console.error("Error toggling autonomy:", error.message);
		}
	}

	async function handleVisibilityChange(): Promise<void> {
		if (document.hidden) {
			previousAutonomyValue = autonomy;
			await updateAutonomy(false);
		} else {
			await updateAutonomy(previousAutonomyValue);
		}
	}

	async function fetchAutonomy() {
		try {
			const autoData = await getAutonomy();
			autonomy = autoData.autonomy;
		} catch (error) {
			console.error("Error fetching autonomy:", error.message);
		}
	}

	function onWebsocketConnection(): void {
		autonomy = false;
		previousAutonomyValue = autonomy;
		autonomyManager.startMonitoring();
		fetchAutonomy();
		autonomyManager.resetUserInputFlag();
	}


	onMount(() => {
		// Initialize WebSocket services.
		controlService = new WebsocketServiceSvelte(`ws://${PUBLIC_CAR_IP}:8080/control`);
		videoService = new WebsocketServiceSvelte(`ws://${PUBLIC_CAR_IP}:8080/video`, handleCameraFrame);
		telemetryService = new WebsocketServiceSvelte(`ws://${PUBLIC_CAR_IP}:8080/telemetry`);
		autonomyModeService = new WebsocketServiceSvelte(`ws://${PUBLIC_CAR_IP}:8080/autonomy`, () => {}, onWebsocketConnection)

		controllerManager = new ControllerManager(controlService);

		autonomyManager = new AutonomyManager(autonomyModeService, controllerManager);

		videoService.connect();
		controlService.connect();
		telemetryService.connect();
		autonomyModeService.connect();

		// Listen for browser tab visibility changes
		document.addEventListener('visibilitychange', handleVisibilityChange);
	});

	onDestroy(() => {
		videoService?.disconnect();
		controlService?.disconnect();
		telemetryService?.disconnect();
		autonomyModeService?.disconnect();
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		autonomyManager?.stopMonitoring();
	});
</script>

<div class="app">
	<CameraFeed {cameraFeed} />

	<button class="menu-button" onclick={() => (showMenu = !showMenu)}>
		{showMenu ? "Close Menu" : "Open Menu"}
	</button>

	<Menu {showMenu} {controllerManager} {autonomy} {updateAutonomy}/>
	<TelemetryBar networkStatus/>
</div>

<style>
	.app {
		position: relative;
		overflow: hidden;
		width: 100vw;
		height: 100vh;
		margin: 0;
	}
	.menu-button {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 101;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;
		transition: background 0.3s;
	}
	.menu-button:hover {
		background: rgba(0, 0, 0, 1);
	}
</style>
