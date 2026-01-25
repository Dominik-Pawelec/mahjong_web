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
		rotation: 0 | 1;
	}

	const stolenDir: Direction = getPosition(block.player!, playerWind)
	if(stolenDir === "bottom") {
		console.log("Somehow you stole from yourself!?"); //TODO: Raise and error?
	}
	const stolenIdx = new Map<Direction, number>([["left", 0], ["top", 1], ["right", 2]]).get(stolenDir)!

	let tilesToDraw: TileAndMeta[] = new Array();
	if(block.kind === "chi") {
		const nonStolenTiles: Tile[] = sortTiles(block.tiles.filter(x => !sameTile(x, block.stolenTile)))
		tilesToDraw.push({tile: new Array(block.stolenTile), rotation: 1})
		for(let t of nonStolenTiles) {
			tilesToDraw.push({tile: new Array(t), rotation: 0})
		}
	}
	else if (block.kind === "pon") {
		for(let i = 0; i < 3; ++i) {
			tilesToDraw.push({tile: new Array(block.tile), rotation: (i === stolenIdx ? 1 : 0)})
		}
	}
	else if (block.kind === "kan") {
		if(block.type === "open") {
			for(let i = 0; i < 2; ++i) {
				tilesToDraw.push({tile: new Array(block.tile), rotation: (i === stolenIdx ? 1 : 0)})
			}
			tilesToDraw.push({tile: new Array(block.tile), rotation: 0})
			tilesToDraw.push({tile: new Array(block.tile), rotation: (2 === stolenIdx ? 1 : 0)})
		}
		else if (block.type === "closed") {
			tilesToDraw.push({tile: new Array({kind: "closed"}), rotation: 0})
			tilesToDraw.push({tile: new Array(block.tile), rotation: 0})
			tilesToDraw.push({tile: new Array(block.tile), rotation: 0})
			tilesToDraw.push({tile: new Array({kind: "closed"}), rotation: 0})
		}
		else if (block.type === "added") {
			for(let i = 0; i < 3; ++i) {
				if(i === stolenIdx) {
					tilesToDraw.push({tile: new Array(block.tile, block.tile), rotation: 1})
				}
				else {
					tilesToDraw.push({tile: new Array(block.tile), rotation: 0})
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
