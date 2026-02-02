<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from "svelte";
	import type { Socket } from "socket.io-client";
	import { getSocket } from "$lib/socket";
	import { user, DEFAULT_NAME } from "$lib/user";

	let socket: Socket;

	let name = '';

	onMount(() => {
		socket = getSocket();
	});

	function setCookie(name: string, value: string, days = 30) {
		const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
		document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`;
	}

	function handleInput() {
		const finalName = name.trim() || DEFAULT_NAME;

		user.update(u => ({ ...u, name: finalName }));
		setCookie("username", finalName);
		socket.emit("change_name", { name: finalName });
	}
</script>

<main class="card">
	<h1>Create Game</h1>

	<div class="options">
		<h3>Tell us your name:</h3>

		<input
			placeholder={$user.name}
			bind:value={name}
			on:input={handleInput}
		/>

		<button class="typ1" on:click={() => goto('/')}>
			Confirm
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
