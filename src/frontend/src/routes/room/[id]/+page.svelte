<script lang="ts">
    import { onMount } from 'svelte';
	import { goto } from '$app/navigation'
	import { page } from '$app/stores';

	const apiEndpoint = "chuj w dupie hlupie"
	let playerCount = 0

	$: roomId = $page.params.id;

	const dots_steps = ['.', '..', '...'];
	let dots = '';

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

<div class="card">
	<h1>
		Waiting for players ({playerCount}/4){dots}
	</h1>
	<p class="hint">
		The game will start automatically when all players join.
	</p>
	<br>
	<button on:click={() => {goto('/')}}>
		Leave
	</button>
</div>
