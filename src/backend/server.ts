import express from "express";
import type { Request, Response } from "express";
import { Server } from "socket.io";
import { Player } from "./player";
import { Game } from "./game_logic";
import http from "http";
import path from "path"
import { Wind } from "@common/mahjonh_types";
import { ServerData, GameRoom, Client } from "@common/comms";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : "http://localhost:5173",
        //methods : ["GET", "POST"]
    }
});

const port = 6060;

server.listen(port, () => {
    console.log("server runs at " + port);
});

const rooms = new Map<string, GameRoom>();

const lobby : Player[] = [];

var game : Game | undefined = undefined;

const winds : Wind[] = ["east", "south", "west", "north"];

//socket.io logic
io.on("connection", (socket : any) => { //TODO: make proper typing, not any
    console.log("User connected :" + socket.id);

    const new_player = new Player(winds[lobby.length] as Wind, socket);
    lobby.push(new_player);
    console.log(lobby.length)

	const client: Client = {
		id: socket.id,
		name: "Guest"
	};

	const sendRoomList = () => {
		io.emit("send_room_list", { rooms: Array.from(rooms.values()) });
	};
    
    if(lobby.length === 4){
        game = new Game([lobby[0],lobby[1],lobby[2],lobby[3]] as [Player, Player, Player, Player]);
        
    }
    if (lobby.length > 4) {
        socket.disconnect(true);
        return;
    }
    
    socket.on("client_response", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        if(data.kind === "discard"){
            player?.resolveAction(data);
        }
        if(data.kind === "meld"){
            player?.resolveSpecialAction(data);
        }

    });
    socket.on("specialChoice", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        
        player?.resolveSpecialAction(data.call);
        
    });

    socket.on("disconnect", () => {
        console.log("User disconnected :" + socket.id);
        const index = lobby.findIndex(p => p.socket.id === socket.id);
        if (index !== -1) lobby.splice(index, 1);
    });

	socket.on("create_room", ({ name }: { name: string }) => {
		const roomId = Math.random().toString(36).slice(2, 8);

		const room: GameRoom = {
			id: roomId,
			name,
			clients: []
		};

		rooms.set(roomId, room);

		console.log(`Room "${name}" created (${roomId})`);

		socket.emit("room_created", { roomId });
		sendRoomList();
	});

	socket.on("join_room", ({ roomId }: { roomId: string }) => {
		const room = rooms.get(roomId);
		if (!room || !client) return;

		room.clients.push(client);

		socket.join(roomId);

		console.log(`Player joined room ${roomId} (${room.clients.length}/4)`);

		io.to(roomId).emit("room_state", room);
		sendRoomList();
	});

	socket.on("quit_room", ({ roomId }: { roomId: string }) => {
		const room = rooms.get(roomId);
		if (!room || !client) return;

		room.clients = room.clients.filter(c => c.id !== client.id);

		socket.leave(roomId);

		console.log(`Player left room ${roomId} (${room.clients.length}/4)`);

		if (room.clients.length === 0) {
			rooms.delete(roomId);
			console.log(`Room ${roomId} deleted (empty)`);
		}

		io.to(roomId).emit("room_state", room);
		sendRoomList();
	});

	socket.on("request_room_list", () => {
		socket.emit("send_room_list", { rooms: Array.from(rooms.values()) });
	})

    socket.onAny((event : any, ...args : any) => {
        console.log(
            `[SOCKET EVENT] ${socket.id} -> ${event}`,
            JSON.stringify(args)
        );
    });
});

