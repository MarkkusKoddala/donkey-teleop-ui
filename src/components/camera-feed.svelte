<script lang="ts">
    export let cameraFeed: string | null;
</script>

<div class="camera-feed">
    {#if cameraFeed}
        <img src={cameraFeed} alt="Camera Feed" />
    {:else}
        <p>Waiting for camera feed...</p>
    {/if}
</div>

<style>
    .camera-feed {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        overflow: hidden;
        background: black;
    }

    .camera-feed img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
