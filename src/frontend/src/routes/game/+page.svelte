<script lang="ts">
	import type { PlayerData, Tile, Block } from "@common/mahjonh_types"
	import { sortTiles } from "@common/mahjonh_types"
	import {onMount, setContext} from "svelte"
	import HandHTML from './Hand.svelte'

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
		type: "open",
		tile: {kind: "dragon", value: "white"},
		player: "west"
	}

	let blocks: Block[] = new Array<Block>();

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
		{kind: "suit", suit: "sou", value: 8}, 
		{kind: "suit", suit: "sou", value: 2},
		{kind: "suit", suit: "man", value: 1},
		{kind: "suit", suit: "sou", value: 1},
		{kind: "suit", suit: "man", value: 2},
		{kind: "suit", suit: "man", value: 1},
		{kind: "suit", suit: "sou", value: 1},
		{kind: "suit", suit: "man", value: 2},
	];

	const exampleRiichiIdx: Number = 8;

	let playerData: PlayerData = {
		hand: sortTiles(exampleHand),
		wind: "east",
		avaliableMelds: new Array(0)
	}
	
</script>

<main>
	<div class="table">
		<div class="seat bottom">
			<HandHTML hand={exampleHand} blocks={blocks} discards={exampleDiscards} riichiIdx={exampleRiichiIdx} />
		</div>
		<div class="seat right">
			<HandHTML hand={exampleHand} blocks={blocks} discards={exampleDiscards} riichiIdx={exampleRiichiIdx} />
		</div>
		<div class="seat left">
			<HandHTML hand={exampleHand} blocks={blocks} discards={exampleDiscards} riichiIdx={exampleRiichiIdx} />
		</div>
		<div class="seat top">
			<HandHTML hand={exampleHand} blocks={blocks} discards={exampleDiscards} riichiIdx={exampleRiichiIdx} />
		</div>
	</div>
</main>

<style>
	.table {
		position: fixed;
		inset: 0;
		pointer-events: none;
		width: 100vmin;
		height: 100vmin;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #2137fe;
		align-items: center;
		justify-items: center;
	}
	.seat {
		position: absolute;
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-items: center;
		width: fit-content;
		height: fit-content;
	}
	.seat.bottom {
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 0%);
		transform-origin: bottom center;
	}
	.seat.right {
		bottom: 50%;
		right: 0;
		transform: translate(50%, 0%) rotate(-90deg);
		transform-origin: bottom center;
	}
	.seat.top {
		top: 0;
		left: 50%;
		transform: translate(-50%, 0%) rotate(180deg);
	}
	.seat.left {
		bottom: 50%;
		left: 0;
		transform: translate(-50%, 0%) rotate(90deg);
		transform-origin: bottom center;
	}
</style>
