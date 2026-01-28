import type { Tile, Meld, Table, Wind } from './mahjonh_types'

export type PlayerResponse = | {
	kind: "discard"
	tile: Tile
} | {
	kind: "meld"
	meld: Meld
}

export type ServerData = {
	table: Table;
	playerTurn: Wind;
}
