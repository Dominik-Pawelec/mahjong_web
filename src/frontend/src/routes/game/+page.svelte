<script lang="ts">
	import type {PublicTableData, PlayerData, Tile} from "@common/mahjonh_types"
	import {onMount} from "svelte"

	onMount(() => {


		return () => {
			
		}
	})

	function sortTiles(tl: Tile[]): Tile[] {
		return tl.sort((t1: Tile, t2: Tile): number => {
			var kindOrder: Map<string, number> = new Map([['suit', 0], ['wind', 1], ['dragon', 2]])
			var suitOrder: Map<string, number> = new Map([['pin', 0], ['sou', 1], ['man', 2]])
			var windOrder: Map<string, number> = new Map([['east', 0], ['south', 1], ['west', 2], ['north', 3]])
			var dragonOrder: Map<string, number> = new Map([['red', 0], ['white', 1], ['green', 2]])
			if(kindOrder.get(t1.kind)! != kindOrder.get(t2.kind)!) { return kindOrder.get(t1.kind)! - kindOrder.get(t2.kind)! }
			if(t1.kind == "suit" && t2.kind == "suit") {
				if(suitOrder.get(t1.suit)! != suitOrder.get(t2.suit)!) { return suitOrder.get(t1.suit)! - suitOrder.get(t2.suit)!}
				return t1.value - t2.value
			}
			else if (t1.kind == "wind" && t2.kind == "wind") {
				return windOrder.get(t1.value)! - windOrder.get(t2.value)!
			}
			else if (t1.kind == "dragon" && t2.kind == "dragon") {
				return dragonOrder.get(t1.value)! - dragonOrder.get(t2.value)!
			}
			return 0// should never happen
		})
	}

	const exampleHand: Tile[] = [
		{kind: "suit", suit: "sou", value: 8}, 
		{kind: "suit", suit: "sou", value: 2},
		{kind: "suit", suit: "man", value: 1},
		{kind: "suit", suit: "sou", value: 1},
		{kind: "suit", suit: "man", value: 2},
		{kind: "suit", suit: "pin", value: 1},
		{kind: "suit", suit: "sou", value: 6},
		{kind: "suit", suit: "pin", value: 2},
		{kind: "dragon", value: "red"},
		{kind: "suit", suit: "sou", value: 1}
	];

	let playerData: PlayerData = {
		hand: sortTiles(exampleHand),
		wind: "east",
		avaliableMelds: new Array(0)
	}
	
</script>

<main>

	<div class="hand">
		{#each playerData.hand as t}
			<div class="tile">
				{t.suit} ({t.value})
			</div>
		{/each}
	</div>
	<div class="blocks">

	</div>

</main>

<style>
	.hand {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 5px;
		z-index: 100;
	}
	.tile {
		width: 75px;
		height: 105px;
		background-color: white;
		border: 1px solid #333;
		border-radius: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
