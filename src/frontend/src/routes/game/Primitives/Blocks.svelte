<script lang="ts">
	import type { Block } from '@common/mahjonh_types'
	import BlockHTML from './Block.svelte'

	export let blocks: Block[];

</script>

<main>
	<div class="blocks">
		{#each blocks as b}
			<BlockHTML block={b} />
		{/each}
	</div>
</main>

<style>
	.blocks {
		display: flex;
		gap: 1.2vmin;
		z-index: 100;
		flex-direction: row;
		align-items: flex-end;
	}
</style>
