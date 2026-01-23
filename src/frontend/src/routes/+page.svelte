<script lang="ts">
	import {goto} from '$app/navigation';

	function enterLobby() {
		goto('/lobby');
	}
</script>

<main>
	<h1>Mahjong Web</h1>
	<button on:click={enterLobby}>Join Game</button>
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
