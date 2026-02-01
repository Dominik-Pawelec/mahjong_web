<script lang="ts">
    import BlocksHTML from './Primitives/Blocks.svelte';
	import TileHTML from './Primitives/Tile.svelte'
	import DiscardsHTML from './Primitives/Discards.svelte'
	import RiichiHTML from './Primitives/Riichi.svelte'
	import type {Tile, Block} from '@common/mahjonh_types'
	import { sortTiles } from '@common/mahjonh_types';

	export let hand: Tile[];
	export let blocks: Block[];
	export let discards: Tile[];
	export let riichiIdx: number | undefined;
	export let callback: ((tile: Tile) => void) | undefined = undefined;

	$: sortedTiles = sortTiles(hand);
</script>

<main>
	<div class="hand">
		<div class="hand-col">
			<div class="col-gap">
				{#if riichiIdx !== undefined}
					<RiichiHTML />
				{/if}
				<DiscardsHTML discards={discards} riichiIdx={riichiIdx} />
			</div>
			<div class="hand-row">
				<div class="tiles">
					{#each sortedTiles as t}
						<TileHTML rotated={false} tile={t} callback={callback}/>
					{/each}
				</div>
				<BlocksHTML blocks={blocks}/>
			</div>
		</div>
	</div>
</main>

<style>
	.hand {
		display: flex;
		z-index: 100;
		align-items: center;
	}
	.tiles {
		display: flex;
		gap: 0.6vmin;
		z-index: 100;
		align-items: flex-end;
	}
	.hand-row {
		display: flex;
		gap: 3vmin;
		z-index: 100;
		align-items: flex-end;
	}
	.hand-col {
		display: flex;
		gap: 5vmin;
		z-index: 100;
		align-items: center;
		flex-direction: column;
	}
	.col-gap {
		gap: 1.2vmin;
		display: flex;
		align-items: center;
		flex-direction: column;
	}
</style>
