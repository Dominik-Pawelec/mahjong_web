<script lang="ts">
	import TileHTML from './Tile.svelte'
	import type { Block, Wind, Tile } from '@common/mahjonh_types';
	import {getContext} from 'svelte'
	import type {Direction} from '../common.ts'
    import { getPosition, sameTile, sortTiles } from '../common';

	const playerWind: Wind = getContext("playerWind");

	export let block: Block;
	
	type TileAndMeta = {
		tile: Tile[];
		rotation: Boolean;
	}

	const stolenDir: Direction = getPosition(block.player!, playerWind)
	if(stolenDir === "bottom") {
		console.log("Somehow you stole from yourself!?"); //TODO: Raise and error?
	}
	const stolenIdx = new Map<Direction, number>([["left", 0], ["top", 1], ["right", 2]]).get(stolenDir)!

	let tilesToDraw: TileAndMeta[] = new Array();
	if(block.kind === "chi") {
		const nonStolenTiles: Tile[] = sortTiles(block.tiles.filter(x => !sameTile(x, block.stolenTile)))
		tilesToDraw.push({tile: new Array(block.stolenTile), rotation: true})
		for(let t of nonStolenTiles) {
			tilesToDraw.push({tile: new Array(t), rotation: false})
		}
	}
	else if (block.kind === "pon") {
		for(let i = 0; i < 3; ++i) {
			tilesToDraw.push({tile: new Array(block.tile), rotation: i === stolenIdx})
		}
	}
	else if (block.kind === "kan") {
		if(block.type === "open") {
			for(let i = 0; i < 2; ++i) {
				tilesToDraw.push({tile: new Array(block.tile), rotation: i === stolenIdx})
			}
			tilesToDraw.push({tile: new Array(block.tile), rotation: false})
			tilesToDraw.push({tile: new Array(block.tile), rotation: 2 === stolenIdx})
		}
		else if (block.type === "closed") {
			tilesToDraw.push({tile: new Array({kind: "closed"}), rotation: false})
			tilesToDraw.push({tile: new Array(block.tile), rotation: false})
			tilesToDraw.push({tile: new Array(block.tile), rotation: false})
			tilesToDraw.push({tile: new Array({kind: "closed"}), rotation: false})
		}
		else if (block.type === "added") {
			for(let i = 0; i < 3; ++i) {
				if(i === stolenIdx) {
					tilesToDraw.push({tile: new Array(block.tile, block.tile), rotation: true})
				}
				else {
					tilesToDraw.push({tile: new Array(block.tile), rotation: false})
				}
			}
		}
	}

</script>

<main>
	<div class="block">
		{#each tilesToDraw as tiles}
			<div class="block-col">
				{#each tiles.tile as t}
					<TileHTML scale={1} rotated={tiles.rotation} tile={t} />
				{/each}
			</div>
		{/each}
	</div>
</main>

<style>
	.block {
		position: relative;
		display: flex;
		gap: 5px;
		z-index: 100;
		align-items: flex-end;
	}
	.block-col {
		position: relative;
		display: flex;
		gap: 5px;
		z-index: 100;
		align-items: flex-end;
		flex-direction: column-reverse;
	}
</style>
