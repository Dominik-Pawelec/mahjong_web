import express from "express";
import cookieParser from 'cookie-parser';
import http from "http";
import { Socket, Server } from "socket.io";
import { Player } from "./player";
import { Game } from "./game_logic";
import { createUUID, releaseUUID } from "./uuid";
import { Wind } from "@common/mahjonh_types";
import { RoomData } from "@common/comms";

const app = express();
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : "http://localhost:5173",
		credentials: true,
        //methods : ["GET", "POST"]
    },
	transports : ["websocket"],
});

type User = {
	name: string;
	id: string;
	socket: Socket | undefined;
	room: Room | undefined;
	game: Game | undefined;
};

class Room {
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
		console.log(`Player joined room ${this.id} (${this.players.length}/4)`);
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
			return new Player(winds[index] as Wind, user.socket);
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

const winds : Wind[] = ["east", "south", "west", "north"];

const rooms = new Map<string, Room>();
const users = new Map<string, User>();
const games = new Map<string, Game>();

const sendRoomList = () => {
	const roomList = Array.from(rooms.values()).map(room => room.getData());
	io.emit("send_room_list", { rooms: roomList });
};

function parseCookies(cookieHeader?: string) {
	if (!cookieHeader) return {};
	return Object.fromEntries(
		cookieHeader.split('; ').map(c => c.split('='))
	);
}

io.on("connection", (socket : any) => { //TODO: make proper typing, not any
	const cookies = parseCookies(socket.handshake.headers.cookie);
	const userId = cookies.userId;
	const username = cookies.userId;

	if (!userId) {
		socket.disconnect();
		return;
	}
	const potentialUser = users.get(userId);
	if(potentialUser) {
		console.log(`User reconnected: (UUID) ${userId} (socketID) ${socket.id}`);
		potentialUser.socket = socket;
	} else {
		console.log(`User connected: (UUID) ${userId} (socketID) ${socket.id}`);
		const user: User = {
			id: userId,
			name: username,
			socket: socket,
			room: undefined,
			game: undefined
		};
		users.set(userId, user);
	}
	const user = users.get(userId) as User;

	socket.on("disconnect", (reason : any) => {
        console.log(`User disconnected: (UUID) ${userId} (socketID) ${socket.id}`);

		if(user.room) {
			user.room.leave(user);
			users.delete(userId);
		} else if(user.game) {

		} else {
			users.delete(userId);
		}
    });

    socket.on("change_name", async (data : string) => {
		user.name = data;
    });
    
    socket.on("client_response", async (data : any) => {
        const player = user.game?.players.find(p => p.socket.id === socket.id);
        if(data.kind === "discard"){
            player?.resolveAction(data);
        }
        if(data.kind === "meld"){
            player?.resolveSpecialAction(data);
        }
    });

    socket.on("specialChoice", async (data : any) => {
        const player = user.game?.players.find(p => p.socket.id === socket.id);
        player?.resolveSpecialAction(data.call);
    });

	socket.on("create_room", ({ name }: { name: string }) => {
		const room: Room = new Room(name);
		socket.emit("room_created", { roomId: room.id } as { roomId: string } );
	});

	socket.on("join_room", ({ roomId }: { roomId: string }) => {
		const room = rooms.get(roomId);
		if (!room) return;
		room.join(user);
	});

	socket.on("quit_room", ({ roomId }: { roomId: string }) => {
		const room = rooms.get(roomId);
		if (!room) return;
		room.leave(user);
	});

	socket.on("request_room_list", () => {
		const roomList = Array.from(rooms.values()).map(room => room.getData());
		socket.emit("send_room_list", { rooms: roomList });
	})

    socket.onAny((event : any, ...args : any) => {
        console.log(
            `[SOCKET EVENT] ${socket.id} -> ${event}`,
            JSON.stringify(args)
        );
    });
});

const port = 6060;

server.listen(port, () => {
    console.log("server runs at " + port);
});
