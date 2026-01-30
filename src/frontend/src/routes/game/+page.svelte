<script lang="ts">
	import type { PlayerData, Tile, Block, Wind, Meld } from "@common/mahjonh_types"
	import { sortTiles } from "@common/mahjonh_types"
	import {onMount, setContext} from "svelte"
	import HandHTML from './Hand.svelte'
	import MeldsHTML from './Melds.svelte'
	import { getPlayerWind } from "./common"
	import '../../app.css'

	setContext("playerWind", "east");
	setContext("colorScheme", "light");

	let playerWind: Wind = "east"
	let tableWind: Wind = "south"
	const windChar: Record<Wind, string> = {east: "東", south: "南", west: "西", north: "北"};

	onMount(() => {
		return () => {
			
		}
	})

	let melds: Meld[] = new Array("tsumo", "ron", "pon", "skip");

	let currentWind = windChar[tableWind];
	let tilesLeft = 45;

	let nameBottom = "orzełB"
	let nameTop = "orzełT"
	let nameLeft = "orzełL"
	let nameRight= "orzełR"

	let pointsBottom = 50000 
	let pointsTop = 9  
	let pointsLeft = 9 
	let pointsRight= 9 

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
	];

	const exampleHand: Tile[] = [
		{kind: "suit", suit: "sou", value: 8}, 
		{kind: "suit", suit: "sou", value: 5, isRed: true},
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

	const exampleRiichiIdx: number | undefined = undefined;

	let playerData: PlayerData = {
		hand: sortTiles(exampleHand),
		wind: "east",
		availableMelds: new Array(0)
	}
	
</script>

<main>
	<div class="table">
		<div class="melds">
			<MeldsHTML melds={melds} />
		</div>
		<div class="meta">
			<div class="info">
				<div class="infoc wind"> {currentWind} </div>
				<div class="infoc tilesLeft"> x{tilesLeft} </div>
			</div>
			<div class="name bottom">
				<div>{windChar[getPlayerWind(tableWind, "bottom")]}</div>
				<div>{nameBottom}: </div>
				<div>{pointsBottom}</div>
			</div>
			<div class="name top">
				<div>{windChar[getPlayerWind(tableWind, "top")]}</div>
				<div>{nameTop}: </div>
				<div>{pointsTop}</div>
			</div>
			<div class="name left">
				<div>{windChar[getPlayerWind(tableWind, "left")]}</div>
				<div>{nameLeft}: </div>
				<div>{pointsLeft}</div>
			</div>
			<div class="name right">
				<div>{windChar[getPlayerWind(tableWind, "right")]}</div>
				<div>{nameRight}: </div>
				<div>{pointsRight}</div>
			</div>
		</div>
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
		width: 100vmin;
		height: 100vmin;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #046115;
		align-items: center;
		justify-items: center;
	}
	.meta {
		position: absolute;
		width: 30vmin;
		height: 30vmin;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #252525;
		border-radius: 2vmin;
		color: silver;
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
		bottom: 1rem;
		left: 50%;
		transform: translate(-50%, 0%);
	}
	.seat.right {
		bottom: 50%;
		right: 1rem;
		transform: translate(50%, 0%) rotate(-90deg);
		transform-origin: bottom center;
	}
	.seat.top {
		top: 1rem;
		left: 50%;
		transform: translate(-50%, 0%) rotate(180deg);
	}
	.seat.left {
		bottom: 50%;
		left: 1rem;
		transform: translate(-50%, 0%) rotate(90deg);
		transform-origin: bottom center;
	}
	.name {
		position: absolute;
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-items: center;
		width: fit-content;
		height: fit-content;
		font-family: yomogi;
		font-size: 2.3vmin;
		flex-direction: row;
		gap: .6vmin;
	}
	.name.bottom {
		bottom: .5vmin;
		left: 50%;
		transform: translate(-50%, 0%);
	}
	.name.right {
		bottom: 50%;
		right: .5vmin;
		transform: translate(50%, 0%) rotate(-90deg);
		transform-origin: bottom center;
	}
	.name.top {
		top: .5vmin;
		left: 50%;
		transform: translate(-50%, 0%) rotate(180deg);
	}
	.name.left {
		bottom: 50%;
		left: .5vmin;
		transform: translate(-50%, 0%) rotate(90deg);
		transform-origin: bottom center;
	}
	.info {
		position: absolute;
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-items: center;
		width: fit-content;
		height: fit-content;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -55%);
		flex-direction: column;
	}
	.infoc {
		font-family: yomogi;
	}
	.infoc.wind {
		font-size: 9vmin;
	}
	.infoc.tilesLeft {
		font-size: 3vmin;
	}
	.melds {
		position: absolute;
		right: 1vmin;  
		bottom: 8vmin; 
		width: fit-content;
		height: fit-content;
		z-index: 5;
		transform-origin: bottom;
	}
</style>
