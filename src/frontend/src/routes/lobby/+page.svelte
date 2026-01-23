<script lang="ts">
    import { onMount } from 'svelte';
	import {writable} from 'svelte/store'
	import {goto} from '$app/navigation'

	const apiEndpoint = "chuj w dupie hlupie"

	const playerCount = writable(1);

	async function fetchPlayerCount() {
		try {
			const response = await fetch(apiEndpoint);
			if(!response.ok) throw new Error('Network response was not ok!');
			const data = await response.json();
			playerCount.set(data.count)
		} catch (err) {
			console.error('(Lobby) Failed to fetch player count:', err)
		}
	}

	onMount(() => {
		//Announce to the server that someone joined the lobby
		fetchPlayerCount()
		const intervalID = setInterval(fetchPlayerCount, 2500)

		return () => {
			clearInterval(intervalID)
			//Announce to the server that someone has left the lobby
		}
	})

	function goMain() {
		goto('/')
	}
</script>

<main>
	<h1>Waiting for players ({$playerCount}/4)</h1>
	<button on:click={goMain}>Go back</button>
</main>

<style>
	main {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-direction: column;
		min-height: 100vh;
		padding-top: 20vh;
		font-family: sans-serif;
	}
</style>
