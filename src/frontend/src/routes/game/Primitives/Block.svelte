<script lang="ts">
	import TileHTML from './Tile.svelte'
	import type { Block, Wind, Tile } from '@common/mahjonh_types';
	import {getContext} from 'svelte'
	import type {Direction} from '../common.ts'
    import { getPlayerPosition } from '../common';
	import { sameTile, sortTiles } from "@common/mahjonh_types"

	const playerWind: Wind = getContext("playerWind");

	export let block: Block;
	
	type TileAndMeta = {
		tile: Tile;
		tile2?: Tile;
		rotation: boolean;
	}

	$: tilesToDraw = new Array<TileAndMeta>();
	$: {
		const newTiles: TileAndMeta[] = [];

		if(block.kind === "chi") {
			const nonStolenTiles: Tile[] = sortTiles(block.tiles.filter(x => !sameTile(x, block.stolenTile, "compareRed")))
			newTiles.push({tile: block.stolenTile, rotation: true})
			for(let t of nonStolenTiles) {
				newTiles.push({tile: t, rotation: false})
			}
		}
		else if (block.kind === "pon") {
			const stolenIdx: number = ({left: 0, top: 1, right: 2} as Record<Direction, number>)[getPlayerPosition(block.player, playerWind)];
			for(let i = 0; i < 3; ++i) {
				newTiles.push({tile: block.tile, rotation: i === stolenIdx})
			}
		}
		else if (block.kind === "kan") {
			if(block.type === "open") {
				const stolenIdx: number = ({left: 0, top: 1, right: 2} as Record<Direction, number>)[getPlayerPosition(block.player, playerWind)];
				for(let i = 0; i < 2; ++i) {
					newTiles.push({tile: block.tile, rotation: i === stolenIdx})
				}
				newTiles.push({tile: block.tile, rotation: false})
				newTiles.push({tile: block.tile, rotation: 2 === stolenIdx})
			}
			else if (block.type === "closed") {
				newTiles.push({tile: {kind: "closed"}, rotation: false})
				newTiles.push({tile: block.tile, rotation: false})
				newTiles.push({tile: block.tile, rotation: false})
				newTiles.push({tile: {kind: "closed"}, rotation: false})
			}
			else if (block.type === "added") {
				const stolenIdx: number = ({left: 0, top: 1, right: 2} as Record<Direction, number>)[getPlayerPosition(block.player, playerWind)];
				for(let i = 0; i < 3; ++i) {
					if(i === stolenIdx) {
						newTiles.push({tile: block.tile, tile2: block.tile, rotation: true})
					}
					else {
						newTiles.push({tile: block.tile, rotation: false})
					}
				}
			}
		}
		tilesToDraw = newTiles;
	}

</script>

<main>
	<div class="block">
		{#each tilesToDraw as tiles}
			<div class="block-col">
				<TileHTML rotated={tiles.rotation} tile={tiles.tile} />
				{#if tiles.tile2 !== undefined}
					<TileHTML rotated={tiles.rotation} tile={tiles.tile2} />
				{/if}
			</div>
		{/each}
	</div>
</main>

<style>
	.block {
		position: relative;
		display: flex;
		gap: 0.6vmin;
		z-index: 100;
		align-items: flex-end;
	}
	.block-col {
		position: relative;
		display: flex;
		gap: 0.6vmin;
		z-index: 100;
		align-items: flex-end;
		flex-direction: column-reverse;
	}
</style>
