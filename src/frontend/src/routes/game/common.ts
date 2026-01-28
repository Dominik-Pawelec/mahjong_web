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


export type ColorScheme = "dark" | "light";
