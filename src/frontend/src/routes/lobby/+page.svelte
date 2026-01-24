<script lang="ts">
    import { onMount } from 'svelte';
	import {writable} from 'svelte/store'
	import {goto} from '$app/navigation'

	const apiEndpoint = "chuj w dupie hlupie"
	let playerCount = 0

	async function fetchPlayerCount() {
		try {
			const response = await fetch(apiEndpoint);
			if(!response.ok) throw new Error('Network response was not ok!');
			const data = await response.json();
			playerCount = data.count
			if(playerCount === 4) goto("/game")
		} catch (err) {
			console.error('(Lobby) Failed to fetch player count:', err)
		}
	}

	const dots_steps = ['.', '..', '...'];
	let dots = "";

	onMount(() => {
		//TODO: Announce to the server that someone joined the lobby
		fetchPlayerCount()
		const fetchIntervalID = setInterval(fetchPlayerCount, 2500)
		let dots_index = 0;
		const dotsIntervalID = setInterval(() => {
			dots = dots_steps[dots_index++];
			dots_index = dots_index % dots_steps.length;
		}, 1000);

		return () => {
			clearInterval(fetchIntervalID)
			clearInterval(dotsIntervalID)
			//TODO: Announce to the server that someone has left the lobby
		}
	})

</script>

<main>
	<h1>Waiting for players ({playerCount}/4){dots}</h1>
	<button on:click={() => {goto('/')}}>Go back</button>
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
