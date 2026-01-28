<script lang="ts">
    import BlocksHTML from './Primitives/Blocks.svelte';
	import TileHTML from './Primitives/Tile.svelte'
	import DiscardsHTML from './Primitives/Discards.svelte'
	import type {Tile, Block} from '@common/mahjonh_types'

	export let hand: Tile[];
	export let blocks: Block[];
	export let discards: Tile[];
	export let riichiIdx: Number;
</script>

<main>
	<div class="hand">
		<div class="hand-col">
				<DiscardsHTML discards={discards} riichiIdx={riichiIdx} />
			<div class="hand-row">
				<div class="tiles">
					{#each hand as t}
						<TileHTML rotated={false} tile={t}/>
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
		flex-direction: row;
		flex-direction: column;
	}
</style>
