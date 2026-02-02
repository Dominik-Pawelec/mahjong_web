<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from '$app/navigation';
	import type { Socket } from "socket.io-client";
	import { getSocket } from "$lib/socket";

	let socket: Socket;
	
	let name = '';
	let created = false;

	onMount(() => {
		socket = getSocket();

		socket.on("room_created", ({ roomId }) => {
			goto(`/room/${roomId}`);
		});

		return () => {
			socket.off("room_created")
		};
	});

	function createRoom() {
		if(created || !name.trim()) return;
		created = true;

		socket.emit("create_room", {
			name: name.trim()
		});
	}
</script>

<main class="card">
	<h1>Create Game</h1>

	<div class="options">
		<input
			placeholder="Room name"
			bind:value={name}
		/>

		<button class="typ2" disabled={!name.trim()} on:click={createRoom}>
			Create
		</button>

		<button class="typ2" on:click={() => goto('/')}>
			Return
		</button>
	</div>
</main>

<style>
	.card {
		max-width: 25rem;
	}
	
	.options {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
</style>
