<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from '$app/navigation';
	import type { Socket } from "socket.io-client";
	import { getSocket } from "$lib/socket";
	import { rooms } from "$lib/rooms";
	import type { RoomData } from "@common/comms";

	let socket: Socket;

	function requestRoomList() {
		socket.emit("request_room_list");
	}

	onMount(() => {
		socket = getSocket();

		const handleRoomList = ({ rooms: newRooms }: { rooms: RoomData[] }) => {
			rooms.set(newRooms);
		};

		socket.on("send_room_list", handleRoomList);

		requestRoomList();

		return () => {
			socket.off("send_room_list")
		};
	});

</script>

<main class="card">
	<h1>Available Games</h1>

	<div class="room-list">
		{#each $rooms as room}
			<div class="room-card">
				<div>
					<h3 title={room.name}>{room.name}</h3>
					<p>{room.players} / 4</p>
				</div>

				<button class="typ2"
					disabled={room.players>= 4}
					on:click={() => goto(`/room/${room.id}`)}
				>
					Join
				</button>
			</div>
		{/each}
	</div>

	<div class="actions">
		<button class="typ2" on:click={requestRoomList}>
			Refresh
		</button>

		<button class="typ2" on:click={() => goto('/')}>
			Return
		</button>
	</div>
</main>

<style>
	.room-list {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem;
		width: 100%;
		margin-bottom: 2rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 10px;

		max-height: 50vh;
		overflow-y: auto;
	}

	.room-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		width: 100%;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
		gap: 1rem;
	}

	.room-card div {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-width: 0;
		overflow: hidden;
	}

	.room-card h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1.1rem;
	}

	.room-card p {
		margin: 0;
		color: #AAAAAA;
		font-size: 0.9rem;
	}

	.room-card button {
		width: 5rem;
		flex-shrink: 0;
	}

	.card {
		min-width: 30rem;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
</style>
