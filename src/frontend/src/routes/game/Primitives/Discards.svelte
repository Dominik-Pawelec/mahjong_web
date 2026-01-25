<script lang="ts">
	import type {Tile} from '@common/mahjonh_types'
	import TileHTML from "./Tile.svelte"
	export let discards: Tile[]
	export let riichiIdx: Number // -1 if no riichi

	type TileAndMeta = {
		tile: Tile;
		rotation: 0 | 1;
	}

	let tileRows: TileAndMeta[][] = new Array(3)
	tileRows[0] = new Array()
	tileRows[1] = new Array()
	tileRows[2] = new Array()

	for(let i = 0; i < 6 && i < discards.length; ++i) {
		tileRows[0].push({tile: discards[i], rotation: (i === riichiIdx ? 1 : 0)})
	}

	for(let i = 6; i < 12 && i < discards.length; ++i) {
		tileRows[1].push({tile: discards[i], rotation: (i === riichiIdx ? 1 : 0)})
	}

	for(let i = 12; i < discards.length; ++i) {
		tileRows[2].push({tile: discards[i], rotation: (i === riichiIdx ? 1 : 0)})
	}
</script>

<main>
	<div class="discarded">
		{#each tileRows as row}
			<div class="discarded-row">
				{#each row as tile}
					<TileHTML rotated={tile.rotation} scale={1} tile={tile.tile} />
				{/each}
			</div>
		{/each}
	</div>

</main>

<style>
	.discarded {
		display: flex;
		flex-direction: column;
		gap: 5px;
		z-index: 100;
		align-items: flex-start;
	}
	.discarded-row {
		display: flex;
		gap: 5px;
		z-index: 100;
		align-items: flex-end;
	}
</style>
