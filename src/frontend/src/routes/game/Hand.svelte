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
		<div class="hand-row">
			<div class="hand-col">
				<div class="hand-row">
					{#each hand as t}
						<TileHTML rotated={false} scale={1} tile={t}/>
					{/each}
				</div>
				<DiscardsHTML discards={discards} riichiIdx={riichiIdx} />
			</div>
		</div>
		<BlocksHTML blocks={blocks}/>
	</div>
</main>

<style>
	.hand {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 50px;
		z-index: 100;
		align-items: flex-end;
	}
	.hand-row {
		display: flex;
		gap: 5px;
		z-index: 100;
		align-items: flex-end;
	}
	.hand-col {
		display: flex;
		gap: 100px;
		z-index: 100;
		align-items: flex-start;
		flex-direction: row;
		flex-direction: column-reverse;
	}
</style>
