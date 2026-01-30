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
	availableMelds: Block[]
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
	return [...tl].sort((t1: Tile, t2: Tile): number => {
		var kindOrder: Record<Tile['kind'], number> = {'suit': 0, 'wind': 1, 'dragon': 2, 'closed': 3}
		var suitOrder: Record<'pin' | 'sou' | 'man', number> = {'pin': 0, 'sou': 1, 'man': 2}
		var windOrder: Record<Wind, number> = {'east': 0, 'south': 1, 'west': 2, 'north': 3}
		var dragonOrder: Record<"red" | "white" | "green", number> = {'red': 0, 'white': 1, 'green': 2}
		if(kindOrder[t1.kind] != kindOrder[t2.kind]) { return kindOrder[t1.kind] - kindOrder[t2.kind] }
		if(t1.kind == "suit" && t2.kind == "suit") {
			if(suitOrder[t1.suit] != suitOrder[t2.suit]) { return suitOrder[t1.suit] - suitOrder[t2.suit]}
			const t1v: number = (t1.value === 5 ? (t1.isRed ? 5 : 5.1) : t1.value)
			const t2v: number = (t2.value === 5 ? (t2.isRed ? 5 : 5.1) : t2.value)
			return t1v - t2v;
		}
		else if (t1.kind == "wind" && t2.kind == "wind") {
			return windOrder[t1.value] - windOrder[t2.value]
		}
		else if (t1.kind == "dragon" && t2.kind == "dragon") {
			return dragonOrder[t1.value] - dragonOrder[t2.value]
		}
		return 0// should never happen
	})
}

export function sameTile(t1: Tile, t2: Tile, redMode: "ignoreRed" | "compareRed"): boolean {
	if(t1.kind === "closed" && t2.kind === "closed") { return true; }
	if(t1.kind === "wind" && t2.kind === "wind") {
		return t1.value === t2.value;
	}
	if(t1.kind === "dragon" && t2.kind === "dragon") {
		return t1.value === t2.value;
	}
	if(t1.kind === "suit" && t2.kind === "suit") {
		if(t1.suit === t2.suit) {
			if(redMode === "ignoreRed") {
				return t1.value === t2.value
			} else {
				if(t1.value === 5 && t2.value === 5) {
					return t1.isRed === t2.isRed
				}
				return t1.value === t2.value
			}
		}
	}
	return false
}
