import { Block, sameTile, sortTiles, Wind} from "../common/mahjonh_types";
import { Tile } from "./game_types";
import { getPairs } from "./hand_calculator";

type HandAsBlocks = (Block | {kind : "pair"; tile : Tile})[];

function isTanyao(blocks : HandAsBlocks){
    for(const block of blocks){
        if(block.kind === "chi"){
            for(const tile of block.tiles){
                if(tile.kind === "dragon" || tile.kind === "wind" || tile.kind === "closed"){
                    return false;
                }
                if(tile.value === 1 || tile.value === 9){
                    return false;
                }
            }
        }
        else{
            if(block.tile.kind === "dragon" || block.tile.kind === "wind" || block.tile.kind === "closed"){
                return false;
            } 
        }
    }
    return true;
}
function isHonitsu(blocks : HandAsBlocks){
    var color : "man" | "pin" | "sou" | null = null;

    for(const block of blocks){
        if(block.kind === "chi"){
            for(const tile of block.tiles){
                if(tile.kind === "dragon" || tile.kind === "wind" || tile.kind === "closed"){continue;}// absurd but we'll ignore that
                if(color === null){
                    color = tile.suit;
                }
                else if(tile.suit !== color){
                    return false;
                }
            }
        }
    }
    return true;
}
function pointsForYakuhai(blocks : HandAsBlocks, playerWind : Wind, roundWind : Wind){
    var points = 0;
    for(const block of blocks){
        if(block.kind === "pon" || block.kind === "kan"){
            if(block.tile.kind === "dragon"){
                points += 1;
            }
            if(block.tile.kind === "wind"){
                if(block.tile.value === playerWind ||block.tile.value === roundWind){
                    points += 1;
                }
            }
        }
    }
    return points;
}
function removeTiles(hand: Tile[], tiles: Tile[]): Tile[] {
    const result = [...hand];
    for (const t of tiles) {
        const idx = result.findIndex(x => sameTile(x, t, "compareRed"));
        if (idx === -1) return [];
        result.splice(idx, 1);
    }
    console.log(tiles, "removed");
    return result;
}

function buildBlocks(h : Tile[], blocks : Block[], ownWind : Wind) : HandAsBlocks[]{
    const hand = sortTiles(h) as Tile[] ;
    if (hand.length === 0) {
        return [blocks];
    }
    const results: HandAsBlocks[] = [];
    const tile : Tile = hand[0]!;
    const allPairs = getPairs(hand);

    const same = hand.filter(t => sameTile(t, tile, "ignoreRed"));
    if (same.length >= 3) {
        const rest = removeTiles(hand, same.slice(0, 3));
        results.push(
            ...buildBlocks(rest, [
                ...blocks,
                { kind: "pon", tile, player : ownWind}
            ], ownWind)
        );
    }

    var nextTile : Tile;
    var nextNextTile : Tile;
    if (tile.kind === "suit") {
        const val : 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9  = tile.value;
        if(val === 8 || val === 9){;}
        if(val === 3){
            nextTile = {
                kind : "suit",
                suit : tile.suit,
                value : 4,
            }
            nextNextTile = {
                kind : "suit",
                suit : tile.suit,
                value : 5,
                isRed : false
            }
        }
        else if(val === 4){
            nextTile = {
                kind : "suit",
                suit : tile.suit,
                value : 5,
                isRed : false
            }
            nextNextTile = {
                kind : "suit",
                suit : tile.suit,
                value : 4,
            }
        }
        else{
            nextTile = {
                kind : "suit",
                suit : tile.suit,
                value : (val + 1) as (2 | 3 | 4 | 6 | 7 | 8),
            }
            nextNextTile = {
                kind : "suit",
                suit : tile.suit,
                value : (val + 2) as (3 | 4 | 6 | 7 | 8 | 9),
            }
        }
        const foundNextTile = hand.filter(x => sameTile(x, nextTile, "ignoreRed"))[0];
        const foundNextNextTile = hand.filter(x => sameTile(x, nextNextTile, "ignoreRed"))[0];
        if(foundNextTile !== undefined && foundNextNextTile !== undefined){
            const rest = removeTiles(hand, [tile, foundNextTile, foundNextNextTile]);
            results.push(
                ...buildBlocks(rest, [
                    ...blocks,
                    { kind: "chi", tiles: [tile, foundNextTile, foundNextNextTile], 
                      stolenTile : tile!, player : ownWind }
                ], ownWind)
            );
        }
    }
    return results;
}

function allPossibleBlocks(hand: Tile[], playerWind : Wind): HandAsBlocks[] {
    const results: HandAsBlocks[] = [];
    const pairs = getPairs(hand);

    for (const pair of pairs) {
        const pairBlock = { kind: "pair", tile: pair } as const;

        const blockCombos = buildBlocks(removeTiles(hand, [pair, pair]), [], playerWind);

        for (const combo of blockCombos) {
            results.push([pairBlock, ...combo]);
        }
    }

    return results;
}
function calculateHan(hand : HandAsBlocks, playerWind : Wind, roundWind : Wind) : number{
    var output = 0;
    if(isHonitsu(hand)){output += 3;}
    if(isTanyao(hand)){output += 1;}
    output += pointsForYakuhai(hand, playerWind, roundWind);
    return output;
}

export function calculatePayout(hand: Tile[], blocks : Block[], playerWind : Wind, roundWind : Wind, win_by : "ron" | "tsumo"){
    let possibleHands = allPossibleBlocks(hand, playerWind);

    let maxHan = 1;

    for (const closedHand of possibleHands) {
        const fullHand: HandAsBlocks = [
            ...closedHand,
            ...blocks
        ];
        const han = calculateHan(fullHand, playerWind, roundWind);
        if (han > maxHan) {
            maxHan = han;
        }
    }

    if(win_by === "tsumo"){ // TODO: more subtle scoring
        return 1000 * Math.pow(2, maxHan - 1) / 3;
    }
    return 1000 * Math.pow(2, maxHan - 1);
}