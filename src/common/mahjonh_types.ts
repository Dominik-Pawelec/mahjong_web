export type Wind = "east" | "south" | "west" | "north";

export type Tile = | {
	kind: "suit";
	suit: "pin" | "sou" | "man";
	value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
} | {
	kind: "wind";
	value: Wind;
} | {
	kind: "dragon";
	value: "red" | "white" | "green";
};

export type Chi = {
	kind: "chi";
	tiles: [Tile, Tile, Tile];
	stolenTileIdx: 0 | 1 | 2;
	player: Wind;
};

export type Pon = {
	kind: "pon";
	tile: Tile;
	player: Wind;
};

export type Kan = | {
	kind: "kan";
	tile: Tile;
	open: true;
	player: Wind;
} | {
	kind: "kan";
	tile: Tile;
	open: false;
	player?: never;
};

export type Block = Chi | Pon | Kan;

export type PublicPlayerData = {
	discards: Tile[];
	blocks: Block[];
	points: Number;
}

export type PlayerData = {
	hand: Tile[];
	wind: Wind;
	avaliableMelds: Block[]
}

export type PublicTableData = {
	wind: Wind;
	doraIndicators: Tile[];
} & {
	[P in Wind]: PublicPlayerData
}

export type Table = {
	tableData: PublicTableData;
} & {
	[P in Wind]: {
		publicData: PublicPlayerData;
		privateData: PlayerData;
	}
}
