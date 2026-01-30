<script lang="ts">
	import type {Tile} from '@common/mahjonh_types'
	import type {ColorScheme} from "../common.ts"
    import { getContext } from 'svelte';

	export let rotated: boolean = false;
	export let tile: Tile;
	export let callback: ((tile: Tile) => void) | undefined = undefined;

	const baseWidth = 4.2
	const baseHeight = baseWidth * 4 / 3
	const colorScheme: ColorScheme = getContext("colorScheme")!;
	const colorSchemePathMap: Record<ColorScheme, string> = {
		dark: "assets/riichi-mahjong-tiles/Black/",
		light: "assets/riichi-mahjong-tiles/Regular/"
	};

	function getTileRenderKey(t: Tile | "front" | "back"): string {
		if(t === "front") { return "Front" }
		if(t === "back") { return "Back" }
		switch(t.kind) {
			case 'closed':
				return "Back"
			case 'suit': {
				const suitName = ({pin: "Pin", sou: "Sou", man: "Man"} as Record<"sou" | "pin" | "man", string>)[t.suit]
				let ret = suitName + t.value
				if(t.value === 5 && t.isRed) {
					ret += '-Dora'
				}
				return ret;
			}
			case 'wind':
				switch(t.value) {
					case 'east': return "Ton";
					case 'south': return "Nan";
					case 'west': return "Shaa";
					case 'north': return "Pei";
				}
			case 'dragon':
				switch(t.value) {
					case 'red': return "Chun";
					case 'white': return "Haku";
					case 'green': return "Hatsu";
				}
		}
	}

	function getTilePath(t: Tile | "front" | "back", cs: ColorScheme): string {
		return colorSchemePathMap[cs] + getTileRenderKey(t) + ".svg";
	}

	function handleClick() {
		callback?.(tile);
	}

	$: width = (rotated ? baseHeight : baseWidth)
	$: height = (rotated ? baseWidth : baseHeight)
	$: rotation = (rotated ? 1 : 0) * 90
	$: tile_text = (tile.kind === "closed" ? "#" : ((tile.kind === "suit") ? tile.suit : "H") + "(" + tile.value + ")")
	$: path = getTilePath(tile, colorScheme);
	$: backPath = getTilePath((tile.kind === "closed" ? "back" : "front"), colorScheme);
</script>

<main>
	{#if callback !== undefined}
		<div class="layout-box" style="width: {width}vmin; height: {height}vmin;">
			<button class="tile" style=" --backPath: url({backPath}); --rotation: {rotation}; " on:click={handleClick}>
				<img src={path} alt={tile_text} class="img" />
			</button>
		</div>
	{:else}
		<div class="layout-box" style="width: {width}vmin; height: {height}vmin;">
			<div class="tile" style="
				--backPath: url({backPath});
				--rotation: {rotation};
				">
				<img src={path} alt={tile_text} class="img" />
			</div>
		</div>
	{/if}
</main>

<style>
	.tile {
		transform-origin: center;
		background-size: cover;
		background-position: center;
		background-origin: center;
		background-repeat: no-repeat;
		overflow: visible;
		z-index: 2;
		background-image: var(--backPath);
		width: 100%;
		height: 100%;
		top: 50%;
		left: 50%;
		transform: rotate(var(--rotation)deg);
	}
	.layout-box {
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
	}
	.img{
		width: 100%;
		height: 100%;
		transform: scale(95%);
	}
	button {
		all: unset;
		transition: background-color 0.15s ease;
		cursor: pointer;
	}
	button:hover {
		border: .2vmin solid gold;
		border-radius: .6vmin;
	}
</style>
