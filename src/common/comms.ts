import type { Tile, Meld, Table, Wind, Block } from './mahjonh_types'

export type PlayerResponse = | {
	kind: "discard";
	tile: Tile;
} | {
	kind: "meld";
	meld: Meld;
	block: Block;
}

export type ServerData = {
	table: Table;
	playerTurn: Wind;
	playerWind: Wind;
}

export type Client = {
	id: string;
	name: string;
};

export type GameRoom = {
	id: string;
	name: string;
	clients: Client[];
};

export const ServerURL = "http://localhost:6060";
