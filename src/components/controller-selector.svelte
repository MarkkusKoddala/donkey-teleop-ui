<script lang="ts">
    import {ControllerTypeNames} from "../controllers/utils";

    export let selectedController: string = "Keyboard";
    export let onSelect: (controller: string) => void;

    const controllerTypes = Object.values(ControllerTypeNames);

</script>

<div class="controller-selector">
    <h3>Select controller</h3>
    <ul>
        {#each controllerTypes as controller}
            <li>
                <button class="primary"
                        class:selected={controller === selectedController}
                        on:click={() => onSelect(controller)}
                >
                    {controller}
                </button>
            </li>
        {/each}
    </ul>
</div>

<style>
    .controller-selector {
        margin-top: 20px;
        color: white;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        margin: 10px 0;
    }
</style>
