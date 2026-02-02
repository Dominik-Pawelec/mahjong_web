<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { user, DEFAULT_NAME } from '$lib/user';

	export let data: {
		userId?: string;
		username?: string;
	};

	user.set({
		name: data.username ?? DEFAULT_NAME
	});
</script>

<div class="app">
	<header>
		<h2 on:click={() => goto('/')}>🀄 Mahjong Web</h2>
		<nav>
			<h3>Let's play { $user.name }!</h3>
			<button on:click={() => goto('/lobby')}>Play</button>
			<button on:click={() => goto('/lobby/create')}>Create</button>
			<button on:click={() => goto('/profile')}>Profile</button>
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		background: radial-gradient(circle at top, #1e293b, #020617);
		color: white;
		font-family: system-ui, sans-serif;
	}

	header {
		flex: 0 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		flex-shrink: 0;
	}

	h2 {
		cursor: pointer;
	}

	nav {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	nav button {
		margin-left: 1rem;
		background: #202540;
		border: 0px solid #475569;
		color: white;
		padding: 0.4rem 0.8rem;
		border-radius: 8px;
		cursor: pointer;
		transition: 0.2s;
		width: 5rem;
	}
	nav button:hover {
		background: #334155;
	}

	main {
		flex: 1 1 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		padding: 1rem;
	}
</style>
