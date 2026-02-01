<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from '$app/navigation';
	import { socket } from "$lib/socket";
	
	let name = '';

	onMount(() => {
		socket.on("room_created", ({ roomId }) => {
			goto(`/room/${roomId}`);
		});

		return () => {
			socket.off("room_created")
		};
	});

	function createRoom() {
		if (!name.trim()) return;

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
