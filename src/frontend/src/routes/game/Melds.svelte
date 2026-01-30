<script lang="ts">
    import type { Meld } from "@common/mahjonh_types";
    import { sortMelds } from "./common";
	import '../../app.css'
    import { goto } from "$app/navigation";

	export let melds: Meld[];

	$: sortedMelds = sortMelds(melds)

	const meldColors: Record<Meld, string> =
		{ tsumo: "red", ron: "orange", riichi: "yellow", kan: "purple", pon: "blue", chi: "green", skip: "azure", };

</script>

<main>
	{#if sortedMelds.length > 1}
		<div class="melds-box">
			{#each sortedMelds as meld}
				<button style="--meldColor: {meldColors[meld]}" on:click={() => {goto("/lobby")}}>
					<span class="text">{meld}</span>
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
	.text {
		transform: translateY(-.2vmin);
	}
	button {
		background-color: #252525;
		transition: background-color 0.15s ease;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 13vmin;
		height: 7.5vmin;
		border-radius: 2vmin;
		border: .6vmin solid var(--meldColor);
		font-family: yomogi;
		font-size: 4vmin;
		color: var(--meldColor);
		cursor: pointer;
	}
	button:hover {
		filter: brightness(0.85);
	}
</style>
