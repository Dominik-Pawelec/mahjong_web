<script lang="ts">
	import type {Tile} from '@common/mahjonh_types'
	import TileHTML from "./Tile.svelte"
	export let discards: Tile[]
	export let riichiIdx: number | undefined;

	type TileAndMeta = {
		tile: Tile;
		rotation: boolean;
	}

	$: tileRows = new Array<TileAndMeta[]>(3)
	$: {
		tileRows[0] = [];
		tileRows[1] = [];
		tileRows[2] = [];
		for(let i = 0; i < 6 && i < discards.length; ++i) {
			tileRows[0].push({tile: discards[i], rotation: (riichiIdx !== undefined) ? i === riichiIdx : false})
		}
		for(let i = 6; i < 12 && i < discards.length; ++i) {
			tileRows[1].push({tile: discards[i], rotation: (riichiIdx !== undefined) ? i === riichiIdx : false})
		}
		for(let i = 12; i < discards.length; ++i) {
			tileRows[2].push({tile: discards[i], rotation: (riichiIdx !== undefined) ? i === riichiIdx : false})
		}
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
		align-items: flex-start;
		height: 18vmin;
	}
	.discarded-row {
		display: flex;
		gap: 0.6vmin;
		align-items: flex-end;
	}
</style>
