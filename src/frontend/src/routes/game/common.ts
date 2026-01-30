import type {Wind, Meld, MeldOption} from '@common/mahjonh_types'

export type Direction = "left" | "right" | "top" | "bottom";

export function getPlayerPosition(myWind: Wind, playerWind: Wind): Direction {
	return ({
		east: {east: "bottom", south: "right", west: "top", north: "left"},
		south: {south: "bottom", west: "right", north: "top", east: "left"},
		west: {west: "bottom", north: "right", east: "top", south: "left"},
		north: {north: "bottom", east: "right", south: "top", west: "left"}
	} as Record<Wind, Record<Wind, Direction>>)[playerWind][myWind];
}

export function getPlayerWind(myWind: Wind, playerDirection: Direction): Wind {
	return ({
		east: {bottom: "east", right: "south", top: "west", left: "north"},
		south: {bottom: "south", right: "west", top: "north", left: "east"},
		west: {bottom: "west", right: "north", top: "east", left: "south"},
		north: {bottom: "north", right: "east", top: "south", left: "west"}
	} as Record<Wind, Record<Direction, Wind>>)[myWind][playerDirection];
}

export function sortMeldOpts(ml: MeldOption[]): MeldOption[] {
	return [...ml].sort((m1: MeldOption, m2: MeldOption): number => {
		const valMap: Record<Meld, number> = {
			tsumo: 0, ron: 1, riichi: 2, kan: 3, pon: 4, chi: 5, skip: 6
		};
		return valMap[m1.meld] - valMap[m2.meld];
	})	
}

export type ColorScheme = "dark" | "light";
