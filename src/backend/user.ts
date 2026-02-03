import { Socket} from "socket.io";
import { Game } from "./game_logic";
import { Room } from "./room";

export type User = {
	name: string;
	id: string;
	socket: Socket | undefined;
	room: Room | undefined;
	game: Game | undefined;
};
