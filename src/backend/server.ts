import { User } from "./user";
import { Room } from "./room";
import { io, users, rooms } from "./global";

function parseCookies(cookieHeader?: string) {
	if (!cookieHeader) return {};
	return Object.fromEntries(
		cookieHeader.split('; ').map(c => c.split('='))
	);
}

io.on("connection", (socket : any) => { //TODO: make proper typing, not any
	const cookies = parseCookies(socket.handshake.headers.cookie);
	const userId = cookies.userId;
	const username  = cookies.username ? decodeURIComponent(cookies.username) : "Mahjong Player"; 

	if (!userId) {
		socket.disconnect();
		return;
	}

	const potentialUser = users.get(userId);
	if(potentialUser) {
		console.log(`User ${username} reconnected: (UUID) ${userId} (socketID) ${socket.id}`);
		potentialUser.socket = socket;
	} else {
		console.log(`User ${username} connected: (UUID) ${userId} (socketID) ${socket.id}`);
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

    socket.on("change_name", (data : string) => {
		user.name = data;
    });

    socket.on("game_join", () => {
		const game = user.game;
		if(!game) return;
        const player = game.players.find(p => p.user.id === user.id);
		player!.user.socket = user.socket;

		if(game.players[0].user.socket && game.players[1].user.socket && game.players[2].user.socket && game.players[3].user.socket) {
			game.run();
		}
    });
    
    socket.on("client_response", (data : any) => {
        const player = user.game?.players.find(p => p.user.id === user.id);
        if(data.kind === "discard"){
            player?.resolveAction(data);
        }
        if(data.kind === "meld"){
            player?.resolveSpecialAction(data);
        }
    });

    socket.on("specialChoice", (data : any) => {
        const player = user.game?.players.find(p => p.user.id === user.id);
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
