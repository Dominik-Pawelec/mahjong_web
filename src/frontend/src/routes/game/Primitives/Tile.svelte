<script lang="ts">
	import type {Tile} from '@common/mahjonh_types'
	import type {ColorScheme} from "../common.ts"
    import { getContext } from 'svelte';

	export let rotated: boolean = false;
	export let tile: Tile;

	const baseWidth = 4.2
	const baseHeight = baseWidth * 4 / 3

	const colorScheme: ColorScheme = getContext("colorScheme")!;

	const colorSchemePathMap = new Map<ColorScheme, string>([
		["dark", "assets/riichi-mahjong-tiles/Black/"],
		["light", "assets/riichi-mahjong-tiles/Regular/"]
	])

	const tileNameMap = new Map<string, string>([
		[JSON.stringify({kind:"closed"}), "Back.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:1}), "Sou1.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:2}), "Sou2.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:3}), "Sou3.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:4}), "Sou4.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:5}), "Sou5.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:"red5"}), "Sou5-Dora.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:6}), "Sou6.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:7}), "Sou7.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:8}), "Sou8.svg"],
		[JSON.stringify({kind:"suit",suit:"sou",value:9}), "Sou9.svg"],

		[JSON.stringify({kind:"suit",suit:"man",value:1}), "Man1.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:2}), "Man2.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:3}), "Man3.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:4}), "Man4.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:5}), "Man5.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:"red5"}), "Man5-Dora.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:6}), "Man6.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:7}), "Man7.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:8}), "Man8.svg"],
		[JSON.stringify({kind:"suit",suit:"man",value:9}), "Man9.svg"],

		[JSON.stringify({kind:"suit",suit:"pin",value:1}), "Pin1.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:2}), "Pin2.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:3}), "Pin3.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:4}), "Pin4.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:5}), "Pin5.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:"red5"}), "Pin5-Dora.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:6}), "Pin6.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:7}), "Pin7.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:8}), "Pin8.svg"],
		[JSON.stringify({kind:"suit",suit:"pin",value:9}), "Pin9.svg"],

		[JSON.stringify({kind:"wind",value:"east"}), "Ton.svg"],
		[JSON.stringify({kind:"wind",value:"south"}), "Nan.svg"],
		[JSON.stringify({kind:"wind",value:"west"}), "Shaa.svg"],
		[JSON.stringify({kind:"wind",value:"north"}), "Pei.svg"],

		[JSON.stringify({kind:"dragon",value:"red"}), "Chun.svg"],
		[JSON.stringify({kind:"dragon",value:"green"}), "Hatsu.svg"],
		[JSON.stringify({kind:"dragon",value:"white"}), "Haku.svg"],
		["Front", "Front.svg"],
		["Back", "Back.svg"],
	])

	$: width = (rotated ? baseHeight : baseWidth)
	$: height = (rotated ? baseWidth : baseHeight)
	$: rotation = (rotated ? 1 : 0) * 90
	$: tile_text = (tile.kind === "closed" ? "#" : ((tile.kind === "suit") ? tile.suit : "H") + "(" + tile.value + ")")
	$: path = colorSchemePathMap.get(colorScheme)! + tileNameMap.get(JSON.stringify(tile))!
	$: backPath = colorSchemePathMap.get(colorScheme)! + tileNameMap.get((tile.kind === "closed" ? "Back" : "Front"));
</script>

<main>
	<div class="layout-box" style="width: {width}vmin; height: {height}vmin;">
		<div class="tile" style="
			width: {baseWidth}vmin;
			height: {baseHeight}vmin;
			background-image: url({backPath});
			top: 50%;
			left: 50%;
			transform: translate(0%, 0%) rotate({rotation}deg);
			">
			<img src={path} alt={tile_text} style="
				width: 100%;
				height: 100%;
				transform: scale(95%);
				" />
		</div>
	</div>
</main>

<style>
	.tile {
		transform-origin: center;
		background-size: cover;
		background-position: center;
		background-origin: center;
		background-repeat: no-repeat;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.layout-box {
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: visible;
	}
</style>
