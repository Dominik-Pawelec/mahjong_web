export type Wind = "east" | "south" | "west" | "north";

export type Tile = | {
	kind: "closed";
} | {
	kind: "suit";
	suit: "pin" | "sou" | "man";
	value: 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9;
} | {
	kind: "suit";
	suit: "pin" | "sou" | "man";
	value: 5;
	isRed : boolean;
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
	stolenTile: Tile;
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
	type: "open" | "added";
	player: Wind;
} | {
	kind: "kan";
	tile: Tile;
	type: "closed";
	player?: never;
};

export type Block = Chi | Pon | Kan;

export type PublicPlayerData = {
	discards: Tile[];
	blocks: Block[];
	points: number;
}

export type PlayerData = {
	hand: Tile[];
	wind: Wind;
	avaliableMelds: Block[]
}

export type Table = {
	roundWind: Wind;
	doraIndicators: Tile[];
	tilesLeft: number;
} & {
	[P in Wind]: {
		publicData: PublicPlayerData;
		privateData: PlayerData;
		playerName: string;
		playerPoints: number;
	}
}

export type Meld = "chi" | "pon" | "kan" | "ron" | "tsumo" | "riichi" | "skip";

export function sortTiles(tl: Tile[]): Tile[] {
	return tl.sort((t1: Tile, t2: Tile): number => {
		var kindOrder: Map<string, number> = new Map([['suit', 0], ['wind', 1], ['dragon', 2]])
		var suitOrder: Map<string, number> = new Map([['pin', 0], ['sou', 1], ['man', 2]])
		var windOrder: Map<string, number> = new Map([['east', 0], ['south', 1], ['west', 2], ['north', 3]])
		var dragonOrder: Map<string, number> = new Map([['red', 0], ['white', 1], ['green', 2]])
		if(kindOrder.get(t1.kind)! != kindOrder.get(t2.kind)!) { return kindOrder.get(t1.kind)! - kindOrder.get(t2.kind)! }
		if(t1.kind == "suit" && t2.kind == "suit") {
			if(suitOrder.get(t1.suit)! != suitOrder.get(t2.suit)!) { return suitOrder.get(t1.suit)! - suitOrder.get(t2.suit)!}
			const t1v: number = (t1.value === 5 ? (t1.isRed ? 5 : 5.1) : t1.value)
			const t2v: number = (t2.value === 5 ? (t2.isRed ? 5 : 5.1) : t2.value)
			return t1v - t2v;
		}
		else if (t1.kind == "wind" && t2.kind == "wind") {
			return windOrder.get(t1.value)! - windOrder.get(t2.value)!
		}
		else if (t1.kind == "dragon" && t2.kind == "dragon") {
			return dragonOrder.get(t1.value)! - dragonOrder.get(t2.value)!
		}
		return 0// should never happen
	})
}

export function sameTile(t1: Tile, t2: Tile): boolean {
	return JSON.stringify(t1) === JSON.stringify(t2);
}
