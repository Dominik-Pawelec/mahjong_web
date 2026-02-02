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

export type RoomData = {
	id: string;
	name: string;
	players: number;
}

export type UserData = {
	name: string;
}

export const ServerURL = "http://localhost:6060";
