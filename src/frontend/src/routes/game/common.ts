import type {Wind, Tile, Meld} from '@common/mahjonh_types'

export type Direction = "left" | "right" | "top" | "bottom";

export function getPlayerPosition(tw: Wind, pw: Wind): Direction {
	return ({
		east: {east: "bottom", south: "right", west: "top", north: "left"},
		south: {south: "bottom", west: "right", north: "top", east: "left"},
		west: {west: "bottom", north: "right", east: "top", south: "left"},
		north: {north: "bottom", east: "right", south: "top", west: "left"}
	} as Record<Wind, Record<Wind, Direction>>)[pw][tw];
}

export function getPlayerWind(tw: Wind, pd: Direction): Wind {
	return ({
		east: {bottom: "east", right: "south", top: "west", left: "north"},
		south: {bottom: "south", right: "west", top: "north", left: "east"},
		west: {bottom: "west", right: "north", top: "east", left: "south"},
		north: {bottom: "north", right: "east", top: "south", left: "west"}
	} as Record<Wind, Record<Direction, Wind>>)[tw][pd];
}

export function sortMelds(ml: Meld[]): Meld[] {
	return [...ml].sort((m1: Meld, m2: Meld): number => {
		const valMap: Record<Meld, number> = {
			tsumo: 0, ron: 1, riichi: 2, kan: 3, pon: 4, chi: 5, skip: 6
		};
		return valMap[m1] - valMap[m2];
	})	
}

export type ColorScheme = "dark" | "light";
