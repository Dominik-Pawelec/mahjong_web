import type {Wind, Tile} from '@common/mahjonh_types'

export type Direction = "left" | "right" | "top" | "bottom";

export function getPosition(wind: Wind, playerWind: Wind): Direction {
	return new Map<Wind, Map<Wind, Direction>>([
		["east", new Map([["east", "bottom"], ["south", "right"], ["west", "top"], ["north", "left"]])],
		["south", new Map([["south", "bottom"], ["west", "right"], ["north", "top"], ["east", "left"]])],
		["west", new Map([["west", "bottom"], ["north", "right"], ["east", "top"], ["south", "left"]])],
		["north", new Map([["north", "bottom"], ["east", "right"], ["south", "top"], ["west", "left"]])]
	]) .get(playerWind)!.get(wind)!;
}

export function getPlayerWinds(w: Wind): Map<Direction, Wind> {
	return new Map<Wind, Map<Direction, Wind>>([
		["east", new Map([["bottom", "east"], ["right", "south"], ["top", "west"], ["left", "north"]])],
		["south", new Map([["bottom", "south"], ["right", "west"], ["top", "north"], ["left", "east"]])],
		["west", new Map([["bottom", "west"], ["right", "north"], ["top", "east"], ["left", "south"]])],
		["north", new Map([["bottom", "north"], ["right", "east"], ["top", "south"], ["left", "west"]])]
	]).get(w)!
}


export type ColorScheme = "dark" | "light";
