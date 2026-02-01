import { Tile } from "./game_types"
import { sortTiles, sameTile, Chi, Wind } from "../common/mahjonh_types";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

function getPairs(h : Tile[]) : Tile[]{
    const hand : Tile[] = JSON.parse(JSON.stringify(h));
    sortTiles(hand);
    const output : Tile[] = [];
    for(let i = 0; i < hand.length; i++){
        for(let k = i+1; k < hand.length; k++){
            const t1 = hand[i];
            const t2 = hand[k];
            if(t1 === undefined || t2 === undefined){
                continue;
            }
            if(sameTile(t1, t2, "ignoreRed")){
                output.push(t1);
            }
        }
    }
    return output
}
function getSequenceStartingWith(h : Tile[], t : Tile) : ([Tile, Tile, Tile] | undefined) {
    const tile = t;
    if(tile.kind !== "suit"){
        return undefined;
    }
    const hand : Tile[] = JSON.parse(JSON.stringify(h));
    const val : 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9  = tile.value;

    var nextTile : Tile;
    var nextNextTile : Tile;
    if(val === 8 || val === 9){return undefined}
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
        return [tile, foundNextTile, foundNextNextTile]
    }
    return undefined;
}

function isWinningHandNoPairs(h : Tile[]){
    const hand : Tile[] = JSON.parse(JSON.stringify(h));
    if (hand[0] === undefined){return true;}
    const fstTile = hand[0];
    const sameFstTile = hand.filter(tile => sameTile(tile, fstTile, "ignoreRed"));
    if(sameFstTile.length >=3){
        var counter = 3;
        for(const tile of sameFstTile){
            if(counter > 0){
                var index = hand.indexOf(tile);
                hand.splice(index, 1);
            }
            counter --;
        }
        return isWinningHandNoPairs(hand)
    }
    if(fstTile.kind === "wind" || fstTile.kind === "dragon"){ return false; }

    const sequence = getSequenceStartingWith(hand, fstTile);
    if(sequence === undefined){ return false; }
    for(const tile of sequence){
        var index = hand.indexOf(tile);
        hand.splice(index, 1);
    }
    return isWinningHandNoPairs(hand)
}

export function isWinningHand(h : Tile []){
    const pairs = getPairs(h);
    for(const pair of pairs){
        const allPairs = h.filter(x => sameTile(x, pair, "ignoreRed"))
        if(allPairs.length < 2){
            continue; //something went wrong with function getPairs(h), should not happen
        }
        const hand : Tile[] = JSON.parse(JSON.stringify(h));
        var counter = 2;
        for(const tile of allPairs){
            if(counter > 0){
                var index = hand.indexOf(tile);
                hand.splice(index, 1);
            }
            counter --;
        }
        if(isWinningHandNoPairs(hand)){ return true; }
    }
    return false;
}

function isSequence(tiles : [Tile, Tile, Tile]) : boolean{
    const tiles_cp = [... tiles] as [Tile, Tile, Tile];

    sortTiles(tiles_cp);
    if(tiles_cp[0].kind === "dragon" || tiles_cp[0].kind === "wind"
    || tiles_cp[1].kind === "dragon" || tiles_cp[1].kind === "wind"
    || tiles_cp[2].kind === "dragon" || tiles_cp[2].kind === "wind"
    ){
        return false;
    }
    if(!(tiles_cp[0].suit === tiles_cp[1].suit && tiles_cp[0].suit === tiles_cp[2].suit)){
        return false;
    }
    if(tiles_cp[0].value + 1 === tiles_cp[1].value && tiles_cp[1].value + 1 === tiles_cp[2].value){
        return true;
    }
    return false;
}
export function getAllSequences(hand : Tile[], discard : Tile | undefined, wind : Wind) : Chi[] {
    var output : Chi[]= [];
    for(let i = 0; i < hand.length; i++){
        for(let j = i+1; j < hand.length; j++){
            if(!hand[i] || !hand[j] || !discard){continue;}
            const potential_sequence = [hand[i], hand[j], discard] as [Tile, Tile, Tile];
            if(isSequence(potential_sequence)){
                output.push({
                    kind : "chi",
                    tiles : potential_sequence,
                    stolenTile : discard,
                    player : wind
                });
            }
        }
    }

    return output;
}