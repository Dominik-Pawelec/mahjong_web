<script lang="ts">
	import type {PublicTableData, PlayerData, Tile, Block } from "@common/mahjonh_types"
	import {onMount, setContext} from "svelte"
	import HandHTML from './Hand.svelte'
	import { sortTiles } from "./common";

	setContext("playerWind", "east");
	setContext("colorScheme", "light");

	onMount(() => {
		return () => {
			
		}
	})

	let kanO: Block = {
		kind: "kan",
		type: "open",
		player: "south",
		tile: {kind: "dragon", value: "red"},
	}

	let kanC: Block = {
		kind: "kan",
		type: "closed",
		tile: {kind: "dragon", value: "green"},
	}

	let kanA: Block = {
		kind: "kan",
		type: "added",
		tile: {kind: "dragon", value: "white"},
		player: "west"
	}

	let blocks: Block[] = new Array<Block>(kanO, kanC, kanA);

	const exampleDiscards: Tile[] = [
		{kind: "suit", suit: "sou", value: 9}, 
		{kind: "suit", suit: "sou", value: 9},
		{kind: "suit", suit: "man", value: 9},
		{kind: "suit", suit: "sou", value: 9},
		{kind: "suit", suit: "man", value: 9},
		{kind: "suit", suit: "pin", value: 9},
		{kind: "suit", suit: "sou", value: 9},
		{kind: "suit", suit: "pin", value: 9},
		{kind: "suit", suit: "sou", value: 8}, 
		{kind: "suit", suit: "sou", value: 2},
		{kind: "suit", suit: "man", value: 1},
		{kind: "suit", suit: "sou", value: 1},
		{kind: "suit", suit: "man", value: 2},
		{kind: "suit", suit: "pin", value: 1},
		{kind: "suit", suit: "sou", value: 6},
		{kind: "suit", suit: "pin", value: 2},
		{kind: "suit", suit: "man", value: 2},
		{kind: "suit", suit: "pin", value: 1},
		{kind: "suit", suit: "sou", value: 6},
		{kind: "suit", suit: "pin", value: 2},
	];

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

	const exampleRiichiIdx: Number = 8;

	let playerData: PlayerData = {
		hand: sortTiles(exampleHand),
		wind: "east",
		avaliableMelds: new Array(0)
	}
	
</script>

<main>
	<HandHTML hand={exampleHand} blocks={blocks} discards={exampleDiscards} riichiIdx={exampleRiichiIdx} />
</main>

<style>

</style>
