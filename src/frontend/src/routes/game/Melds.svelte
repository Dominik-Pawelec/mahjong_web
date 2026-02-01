<script lang="ts">
	//TODO: Test
    import type { Block, Meld, MeldOption } from "@common/mahjonh_types";
    import { sortMeldOpts } from "./common";
	import '../../app.css'
    import BlockHTML from "./Primitives/Block.svelte";

	export let melds: MeldOption[];
	export let callback: ((m: Meld, b: Block) => void);

	$: sortedMelds = sortMeldOpts(melds)
	let selectedMeld: MeldOption | undefined = undefined;

	const meldColors: Record<Meld, string> =
		{ tsumo: "red", ron: "orange", riichi: "yellow", kan: "purple", pon: "blue", chi: "green", skip: "azure", };

	$: {
		if(selectedMeld) {
			if(selectedMeld.meld === "tsumo") {
				callback("skip", {} as Block)
			}
			if(selectedMeld.meld === "ron") {
				callback("skip", {} as Block)
			}
			if(selectedMeld.meld === "riichi") {
				callback("skip", {} as Block)
			}
			if(selectedMeld.meld === "skip") {
				callback("skip", {} as Block)
			}
			if(selectedMeld.blocks.length === 1) {
				callback(selectedMeld.meld, selectedMeld.blocks[0])
			}
		}
	}

</script>

<main>
	{#if sortedMelds.length > 1 && selectedMeld === undefined}
		<div class="melds-box">
			{#each sortedMelds as meld}
				<button on:click={() => {selectedMeld = meld}} style="--meldColor: {meldColors[meld.meld]}" class="button-meld">
					<span class="text">{meld.meld}</span>
				</button>
			{/each}
		</div>
	{:else if selectedMeld  && selectedMeld.meld !== "skip" && selectedMeld.blocks.length > 1}
		<div class="blocks-box">
			{#each selectedMeld.blocks as block}
				<button on:click={() => {callback(selectedMeld!.meld, block)}} class="button-block">
					<BlockHTML block={block} />
				</button>
			{/each}
		</div>
	{/if}
</main>

<style>
	.melds-box {
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
		width: fit-content;
		height: fit-content;
		background-color: #252525;
		padding: 1vmin;
		gap: 1vmin;
		border: .3vmin solid #141414;
		border-radius: 1vmin;
		z-index: 5;
	}
	.blocks-box {
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
		width: fit-content;
		height: fit-content;
		background-color: #252525;
		padding: 1vmin;
		gap: 1vmin;
		border: .3vmin solid #141414;
		border-radius: 1vmin;
		z-index: 5;
	}
	.text {
		transform: translateY(-.2vmin);
	}
	button {
		all: unset;
		background-color: #252525;
		transition: background-color 0.15s ease;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		user-select: none;
	}
	button:hover {
		filter: brightness(0.85);
	}
	.button-meld {
		width: 13vmin;
		height: 7.5vmin;
		border-radius: 2vmin;
		border: .6vmin solid var(--meldColor);
		font-family: yomogi;
		font-size: 4vmin;
		color: var(--meldColor);
	}
	.button-block {
		width: fit-content;
		height: 7.5vmin;
		border-radius: 1vmin;
		border: .5vmin solid #363636;
	}
</style>
