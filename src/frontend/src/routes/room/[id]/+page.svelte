<script lang="ts">
    import { onMount } from 'svelte';
	import { goto } from '$app/navigation'
	import type { Socket } from "socket.io-client";
	import { getSocket } from "$lib/socket";
	import { page } from '$app/stores';
	import type { RoomData } from "@common/comms";

	let socket: Socket;

	$: roomId = $page.params.id;

	let playerCount = 0;
	let roomName = 'Game Lobby';

	const dots_steps = ['', '.', '..', '...'];
	let dots = '';

	const leaveRoom = () => {
		socket.emit("quit_room", { roomId });
	};

	onMount(() => {
		socket = getSocket();
		(async () => {
			if (!socket.connected) {
				await new Promise<void>(resolve => {
					socket.once("connect", () => resolve());
				});
			}
			socket.emit("join_room", { roomId });
		})();

		socket.on("room_state", (roomData : RoomData) => {
			playerCount = roomData.players;
			roomName = roomData.name;
		});

		socket.on("game_started", () => {
			goto('/game')
		});

		let dots_index = 0;
		const dotsIntervalID = setInterval(() => {
			dots = dots_steps[dots_index++];
			dots_index = dots_index % dots_steps.length;
		}, 500);

		window.addEventListener("beforeunload", leaveRoom);
		return () => {
			clearInterval(dotsIntervalID)
			socket.off("room_state");
			socket.off("game_started");
			leaveRoom();
			window.removeEventListener("beforeunload", leaveRoom);
		}
	})
</script>

<div class="card">
	<h1>
		{roomName}
	</h1>

	<h3 class="waiting">
		<span class="text-wrapper">
			Waiting for players ({playerCount}/4)
			<span class="dots">{dots}</span>
		</span>
	</h3>

	<br>

	<p class="hint">
		The game will start automatically when all players join.
	</p>

	<br>

	<button on:click={() => {goto('/')}}>
		Leave
	</button>
</div>

<style>
	.waiting {
		text-align: center;
		position: relative;
	}

	.text-wrapper {
		display: inline-block;
		position: relative;
	}

	.dots {
		position: absolute;
		left: 100%;
		top: 0;
		white-space: pre;
	}
</style>
