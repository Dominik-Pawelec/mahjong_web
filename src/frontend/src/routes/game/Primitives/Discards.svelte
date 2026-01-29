<script lang="ts">
	import type {Tile} from '@common/mahjonh_types'
	import TileHTML from "./Tile.svelte"
	export let discards: Tile[]
	export let riichiIdx: number; // -1 if no riichi

	type TileAndMeta = {
		tile: Tile;
		rotation: boolean;
	}

	let tileRows: TileAndMeta[][] = new Array(3)
	tileRows[0] = new Array()
	tileRows[1] = new Array()
	tileRows[2] = new Array()

	for(let i = 0; i < 6 && i < discards.length; ++i) {
		tileRows[0].push({tile: discards[i], rotation: i === riichiIdx})
	}

	for(let i = 6; i < 12 && i < discards.length; ++i) {
		tileRows[1].push({tile: discards[i], rotation: i === riichiIdx})
	}

	for(let i = 12; i < discards.length; ++i) {
		tileRows[2].push({tile: discards[i], rotation: i === riichiIdx})
	}
</script>

<main>
	<div class="discarded">
		{#each tileRows as row}
			<div class="discarded-row">
				{#each row as tile}
					<TileHTML rotated={tile.rotation} tile={tile.tile} />
				{/each}
			</div>
		{/each}
	</div>

</main>

<style>
	.discarded {
		display: flex;
		flex-direction: column;
		gap: 0.6vmin;
		z-index: 100;
		align-items: flex-start;
		height: 18vmin;
	}
	.discarded-row {
		display: flex;
		gap: 0.6vmin;
		z-index: 100;
		align-items: flex-end;
	}
</style>
