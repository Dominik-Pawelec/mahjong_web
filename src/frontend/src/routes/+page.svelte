<script lang="ts">
	import {goto} from '$app/navigation';
	import { onMount } from "svelte";
	import type { Socket } from "socket.io-client";
	import { getSocket } from "$lib/socket";

	onMount(() => {
		getSocket();
	});
</script>

<div class="card">
	<h1>Mahjong Web</h1>
	<br>
	<div class="actions">
		<button class="typ1" on:click={() => goto('/lobby')}>
			Join Game
		</button>
		<button class="typ2" on:click={() => goto('/lobby/create')}>
			Create Game
		</button>
		<button class="typ2" on:click={() => goto('/profile')}>
			Profile
		</button>
	</div>
</div>

<style>
	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.card {
		max-width: 25rem;
	}
</style>
