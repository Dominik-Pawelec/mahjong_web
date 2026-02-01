<script lang="ts">
	import type { Tile, Block, Wind, Meld } from "@common/mahjonh_types"
	import { onMount, setContext } from "svelte"
	import HandHTML from './Hand.svelte'
	import MeldsHTML from './Melds.svelte'
	import { getPlayerWind, type Direction } from "./common"
	import type { ServerData, PlayerResponse } from "@common/comms"
	import { ServerURL } from "@common/comms"
	import '../../app.css'
	import io from	'socket.io-client'
    import type { Socket } from "socket.io-client";

	const windChar: Record<Wind, string> = {east: "東", south: "南", west: "西", north: "北"};
	const directions: Direction[] = ["bottom", "top", "left", "right"];

	let gameData: ServerData;
	let socket: Socket;

	$: {
		if(gameData) {
			setContext("playerWind", gameData.playerWind)

		}
	}

	onMount(() => {
		socket = io(ServerURL);
		socket.on('server_packet', (data: ServerData) => {
			gameData = data;
		})

		return () => {
			socket.disconnect();		
		}
	})

	function meldCallback(m: Meld, b: Block) {
		socket.emit("client_response", { kind: "meld", meld: m, block: b } as PlayerResponse);
	}

	function discardCallback(t: Tile) {
		socket.emit("client_response", { kind: "discard", tile: t } as PlayerResponse);
	}
	
</script>

<main>
	{#if gameData}
		<div class="table">
			<div class="melds">
				<MeldsHTML melds={gameData.table[gameData.playerWind].privateData.availableMelds} callback={meldCallback} />
			</div>
			<div class="meta">
				<div class="info">
					<div class="infoc wind"> {gameData.table.roundWind} </div>
					<div class="infoc tilesLeft"> x{gameData.table.tilesLeft} </div>
				</div>
				{#each directions as direction}
					<div class="name {direction}">
						<div>{windChar[getPlayerWind(gameData.playerWind, direction)]}</div>
						<div>{gameData.table[getPlayerWind(gameData.playerWind, direction)].name}: </div>
						<div>{gameData.table[getPlayerWind(gameData.playerWind, direction)].points}: </div>
					</div>
				{/each}
			</div>
			{#each directions as direction}
				<div class="seat {direction}">
					<HandHTML
						hand={gameData.table[getPlayerWind(gameData.playerWind, direction)].privateData.hand}
						blocks={gameData.table[getPlayerWind(gameData.playerWind, direction)].publicData.blocks}
						discards={gameData.table[getPlayerWind(gameData.playerWind, direction)].publicData.discards}
						riichiIdx={gameData.table[getPlayerWind(gameData.playerWind, direction)].publicData.riichiIdx}
						callback={(direction === "bottom" && gameData.playerWind === gameData.playerTurn ? discardCallback : undefined)}
					/>
				</div>
			{/each}
		</div>
	{:else}
		<div class="error">Game server is unresponsive :c</div>
	{/if}
</main>

<style>
	.table {
		user-select: none;
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
	.error {
		font-family: yomogi;
		font-size: 5vmin;
		color: silver;
		padding: 2vmin;
	}
</style>
