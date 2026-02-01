import io from "socket.io-client";
import { ServerURL } from "@common/comms";
import type { Socket } from "socket.io-client";

export const socket: Socket = io(ServerURL, {
	autoConnect: true,
	transports: ['polling']
});
