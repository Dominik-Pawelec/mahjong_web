<script lang="ts">
	import { rooms } from '$lib/stores/rooms';
	import { goto } from '$app/navigation';

	let name = '';

	function createRoom() {
		const id = crypto.randomUUID();

		rooms.update(r => [
			...r,
			{ id, name, players: 1 }
		]);

		goto(`/room/${id}`);
	}
</script>

<main class="card">
	<h1>Create Game</h1>

	<input
		placeholder="Room name"
		bind:value={name}
	/>

	<button class="typ2" disabled={!name} on:click={createRoom}>
		Create
	</button>

	<button class="typ2" on:click={() => goto('/')}>
		Return
	</button>
</main>

<style>
	.card {
		max-width: 25rem;
	}
</style>
