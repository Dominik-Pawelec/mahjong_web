<script lang="ts">
	import {goto} from '$app/navigation';
</script>

<div class="card">
	<h1>Mahjong Web</h1>
	<div class="actions">
		<button class="typ1" on:click={() => goto('/lobby')}>Join Game</button>
		<button class="typ2" on:click={() => goto('/profile')}>Profile</button>
	</div>
</div>

<style>
	.card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		padding: 3rem;
		width: 320px;
		text-align: center;
		box-shadow: 0 20px 40px rgba(0,0,0,0.4);
	}

	h1 {
		font-size: 2.2rem;
		margin-bottom: 1rem;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	button {
		border: none;
		border-radius: 10px;
		padding: 0.75rem;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	button.typ1 {
		background: #22c55e;
		color: #052e16;
	}
	button.typ1:hover { background: #16a34a; }

	button.typ2 {
		background: #334155;
		color: white;
	}
	button.typ2:hover { background: #475569; }
</style>
