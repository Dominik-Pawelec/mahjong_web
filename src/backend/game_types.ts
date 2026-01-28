export type Call = "skip" | "chi" | "pon" | "kan" | "ron" | "tsumo";
export const allCalls : Call[] = ["skip","chi", "pon", "kan", "ron", "tsumo"]

import type * as Common from "@common/mahjonh_types";

export type Tile = Exclude<Common.Tile, {kind : "closed"}>;

export function generate_all_tiles() : Tile[] {
    var output : Tile[] = [];
    for(var i = 0; i < 4; i++){
        output.push({
            kind : "dragon",
            value : "red"});
        output.push({
            kind : "dragon",
            value : "green"});
        output.push({
            kind : "dragon",
            value : "white"});
        
        output.push({
            kind : "wind",
            value : "east"});
        output.push({
            kind : "wind",
            value : "south"});
        output.push({
            kind : "wind",
            value : "west"});
        output.push({
            kind : "wind",
            value : "north"});
        
        const suits : ("man" | "pin" | "sou" )[] = ["man", "pin", "sou"];
        const values : (1 | 2 | 3 | 4 | 6 | 7 | 8 | 9) [] = [1, 2, 3, 4, 6, 7, 8, 9]; 
        for(const suit of suits){
            for(const value of values){
                output.push({
                    kind : "suit",
                    suit : suit,
                    value : value
                });
            }
            if(i === 0){
                output.push({
                    kind : "suit",
                    suit : suit,
                    value : 5,
                    isRed : true
                });
            }
            else{
                output.push({
                    kind : "suit",
                    suit : suit,
                    value : 5,
                    isRed : false
                });
            }
        }
        
    }
    return output;
}

export function sameTile(t1 : Tile, t2 : Tile) : boolean{
    if(t1.value === 5 && t2.value === 5){
        return true;
    }
    return JSON.stringify(t1) === JSON.stringify(t2);
}
/*
function getPairs(tiles : Tile[]) : Tile[] {
    var counts = new Map<string, number>;
    for(const tile of tiles){
        const key = JSON.stringify(tile);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    var list_of_keys = ([... counts].filter(([_, value]) => value >= 2)).map(([key, _]) => key);
    var pairs : Tile[] = [];
    for(const tile of tiles){
        const key = JSON.stringify(tile);
        if(list_of_keys.includes(key)){
            pairs.push(tile);
            const index = list_of_keys.indexOf(key);
            list_of_keys.splice(index, 1);
        }
    }
    return pairs;
};*/
/*
function isWinningHandNoPairs(tiles : Tile[]) : boolean{
    var tiles_copy = [... tiles];
    if (tiles_copy[0] === undefined){return true;}

    var fst = tiles_copy[0];
    var nr_of_fst = tiles_copy.filter(tile => JSON.stringify(tile) === JSON.stringify(fst)).length;
    if(nr_of_fst >=3){
        for(var i = 0; i < 3; i++){
            var index = tiles_copy.indexOf(fst);
            tiles_copy.splice(index, 1);
        }
        return isWinningHandNoPairs(tiles_copy)
    }
    if(fst.kind === "wind" || fst.kind === "dragon"){return false;}

    
    var snd_acc = {
        kind : fst.kind,
        suit : fst.suit,
        value : fst.value + 1
    };
    var trd_acc = new Tile(fst.nr + 2, fst.type);
    var snd = tiles_copy.find(tile => JSON.stringify(tile) ===  JSON.stringify(snd_acc));
    var trd = tiles_copy.find(tile => JSON.stringify(tile) ===  JSON.stringify(trd_acc));
    if(snd !== undefined && trd !== undefined){
        for(var tile of [fst, snd, trd]){
            var temp_tile = tiles_copy.find( tile2 => tile2.compare(tile) === 0);
        if(temp_tile === undefined){return false;} //Absurd
        var index = tiles_copy.indexOf(temp_tile);
        tiles_copy.splice(index, 1);
        }
        return isWinningHandNoPairs(tiles_copy);
    }   
    return false;
};

export function isWinningHand(tiles : Tile[]) : boolean{
    var tiles_copy = [... tiles];
    sort(tiles_copy);

    const pairs = getPairs(tiles_copy);

    for(var pair of pairs){
        var tiles_copy2 = [... tiles_copy];
        for(var i = 0; i < 2; i++){
            var temp_tile = tiles_copy2.find( tile2 => tile2.compare(pair) === 0);
            if(temp_tile === undefined){return false;} //Absurd
            var index = tiles_copy2.indexOf(temp_tile);
            tiles_copy2.splice(index, 1);
        }
        if(isWinningHandNoPairs(tiles_copy2)){return true;}
    }
    return false;
};
*/
