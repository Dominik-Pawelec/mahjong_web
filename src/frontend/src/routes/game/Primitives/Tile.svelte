<script lang="ts">
	import type {Tile} from '@common/mahjonh_types'
	import type {ColorScheme} from "../common.ts"
    import { getContext } from 'svelte';

	type Rotation = 0 | 1;
	export let rotated: Rotation = 0;
	export let scale = 1;
	export let tile: Tile;

	const baseWidth = 50;
	const baseHeight = 75;

	const colorScheme: ColorScheme = getContext("colorScheme")!;

	const colorSchemePathMap = new Map<ColorScheme, string>([
		["dark", "assets/riichi-mahjong-tiles/Black/"],
		["light", "assets/riichi-mahjong-tiles/Regular/"]
	])

	const tileNameMap = new Map<string, string>([
		['{"kind":"closed"}', "Back.svg"],
		['{"kind":"suit","suit":"sou","value":1}', "Sou1.svg"],
		['{"kind":"suit","suit":"sou","value":2}', "Sou2.svg"],
		['{"kind":"suit","suit":"sou","value":3}', "Sou3.svg"],
		['{"kind":"suit","suit":"sou","value":4}', "Sou4.svg"],
		['{"kind":"suit","suit":"sou","value":5}', "Sou5.svg"],
		['{"kind":"suit","suit":"sou","value":"red5"}', "Sou5-Dora.svg"],
		['{"kind":"suit","suit":"sou","value":6}', "Sou6.svg"],
		['{"kind":"suit","suit":"sou","value":7}', "Sou7.svg"],
		['{"kind":"suit","suit":"sou","value":8}', "Sou8.svg"],
		['{"kind":"suit","suit":"sou","value":9}', "Sou9.svg"],

		['{"kind":"suit","suit":"man","value":1}', "Man1.svg"],
		['{"kind":"suit","suit":"man","value":2}', "Man2.svg"],
		['{"kind":"suit","suit":"man","value":3}', "Man3.svg"],
		['{"kind":"suit","suit":"man","value":4}', "Man4.svg"],
		['{"kind":"suit","suit":"man","value":5}', "Man5.svg"],
		['{"kind":"suit","suit":"man","value":"red5"}', "Man5-Dora.svg"],
		['{"kind":"suit","suit":"man","value":6}', "Man6.svg"],
		['{"kind":"suit","suit":"man","value":7}', "Man7.svg"],
		['{"kind":"suit","suit":"man","value":8}', "Man8.svg"],
		['{"kind":"suit","suit":"man","value":9}', "Man9.svg"],

		['{"kind":"suit","suit":"pin","value":1}', "Pin1.svg"],
		['{"kind":"suit","suit":"pin","value":2}', "Pin2.svg"],
		['{"kind":"suit","suit":"pin","value":3}', "Pin3.svg"],
		['{"kind":"suit","suit":"pin","value":4}', "Pin4.svg"],
		['{"kind":"suit","suit":"pin","value":5}', "Pin5.svg"],
		['{"kind":"suit","suit":"pin","value":"red5"}', "Pin5-Dora.svg"],
		['{"kind":"suit","suit":"pin","value":6}', "Pin6.svg"],
		['{"kind":"suit","suit":"pin","value":7}', "Pin7.svg"],
		['{"kind":"suit","suit":"pin","value":8}', "Pin8.svg"],
		['{"kind":"suit","suit":"pin","value":9}', "Pin9.svg"],

		['{"kind":"wind","value":"east"}', "Ton.svg"],
		['{"kind":"wind","value":"south"}', "Nan.svg"],
		['{"kind":"wind","value":"west"}', "Shaa.svg"],
		['{"kind":"wind","value":"north"}', "Pei.svg"],

		['{"kind":"dragon","value":"red"}', "Chun.svg"],
		['{"kind":"dragon","value":"green"}', "Hatsu.svg"],
		['{"kind":"dragon","value":"white"}', "Front.svg"]
	])


	$: width = (rotated === 1 ? baseHeight : baseWidth) * scale
	$: height = (rotated === 1 ? baseWidth : baseHeight) * scale
	$: rotation = rotated * 90
	$: tile_text = (tile.kind === "closed" ? "#" : ((tile.kind === "suit") ? tile.suit : "H") + "(" + tile.value + ")")
	$: path = colorSchemePathMap.get(colorScheme)! + tileNameMap.get(JSON.stringify(tile))!
	$: backPath = colorSchemePathMap.get(colorScheme)! + tileNameMap.get('{"kind":"dragon","value":"white"}')!
</script>

<div style="width: {width}px; height: {height}px;">
	<div class="tile" style="transform: rotate({rotation}deg); background-image: url({backPath});">
		<img src={path} alt={tile_text} class="imgh" />
	</div>
</div>

<style>
	.tile {
		transform-origin: center;
		background-size: cover;
		background-position: center;
		background-origin: center;
		background-repeat: no-repeat;
		overflow: hidden;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
	}
	.imgh {
		object-fit: cover;
		width: 100%;
		height: 100%;
		
	}
</style>
