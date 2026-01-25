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
		gap: 20px;
		z-index: 100;
		flex-direction: column-reverse;
	}
</style>
