import { Player } from "./player";
import { Game } from "./game_logic";
import { User } from "./user";
import { createUUID, releaseUUID } from "./uuid";
import { Wind } from "@common/mahjonh_types";
import { RoomData } from "@common/comms";
import { io, winds, rooms, games } from "./global";

const sendRoomList = () => {
	const roomList = Array.from(rooms.values()).map(room => room.getData());
	io.emit("send_room_list", { rooms: roomList });
};

export class Room {
	public id: string;
	public name: string;
	public players: User[];
	public constructor(name: string) {
		this.id = createUUID();
		this.name = name
		this.players = [];
		rooms.set(this.id, this);
		console.log(`Room "${this.name}" created (${this.id})`);
		sendRoomList();
	}
	public destroy() {
		releaseUUID(this.id)
		this.players.forEach(p => {
			p.room = undefined;
		});
		rooms.delete(this.id);
		sendRoomList();
	}
	public getData() {
		return {
			id: this.id,
			name: this.name,
			players: this.players.length 
		} as RoomData;
	}
	public updateState() {
		io.to(this.id).emit("room_state", this.getData());
		sendRoomList();
	}
	public isEmpty() {
		return this.players.length === 0;
	}
	public deleteIfEmpty() {
		if(this.isEmpty()) this.destroy();
	}
	public join(user: User) {
		this.players.push(user);
		user.socket!.join(this.id);
		console.log(`Player ${user.name} joined room ${this.id} (${this.players.length}/4)`);
		this.updateState();
		if(this.players.length === 4) this.createGame();
	}
	public leave(user: User) {
		const index = this.players.indexOf(user);
		if (index !== -1) {
			const player = this.players[index]!;
			player.room = undefined;
			if(player.socket) player.socket.leave(this.id);
			this.players.splice(index, 1);
		}
		this.deleteIfEmpty();
		this.updateState();
		console.log(`Player left room ${this.id} (${this.players.length}/4)`);
	}
	public createGame() {
		const players = this.players.map((user, index) => {
			return new Player(winds[index] as Wind, user);
		});

		const game = new Game(players as [Player, Player, Player, Player]);
		const id = createUUID();
		games.set(id, game);

		this.players.forEach(user => {
			user.game = game;
			user.socket?.emit("game_started");
		});

		this.destroy();

		console.log(`Game ${this.id} started`);

		return game;
	}
};

