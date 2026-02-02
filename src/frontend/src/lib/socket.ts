import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import { ServerURL } from "@common/comms";

let socket: Socket | null = null;

export function getSocket(): Socket {
	if (!socket) {
		socket = io(ServerURL, {
			autoConnect: true,
			transports: ["websocket"],
			withCredentials: true
		});
	}
	return socket;
}
