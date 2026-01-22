export type TileColor = "man" | "pin" | "sou" | "honor";
export const tileColors : TileColor[] = ["man", "pin", "sou", "honor"]

export type Call = "skip" | "chi" | "pon" | "kan" | "ron" | "tsumo";
export const allCalls : Call[] = ["skip","chi", "pon", "kan", "ron", "tsumo"]

export class Tile{
    public constructor(public nr : number, public type : TileColor,){
        if(type === "honor"){
            if(nr < 1 || nr > 7){
                throw Error("Wrong tile definition");
            }
        }
        else{
            if(nr < 1 || nr > 9){
                throw Error("Wrong tile definition");
            }
        }
    };
    public toString() : string {
        if(this.type === "honor"){
            const symbol = ["東", "南", "西", "北", "白", "中", "發"][this.nr-1];
            if(symbol === undefined){
                return "UNKNOWN SYMBOL";
            }
            return symbol;
        }
        else{
        return(this.nr.toString() + this.type[0]);
        }
    }
    public compare(other : Tile) : number{
        return this.toString().localeCompare(other.toString());
    }
}


export function generate_all_tiles() : Tile[] {
    var output : Tile[] = [];
    for(var i = 0; i < 4; i++){
        for(const color of tileColors){
            if(color === "honor"){
                for(let nr = 1; nr < 8; nr++){
                    output.push(new Tile(nr, color));
                }
            }
            else{
                for(let nr = 1; nr < 10; nr++){
                    output.push(new Tile(nr, color));
                }
            }
        }  
    }
    return output;
}

function getPairs(tiles : Tile[]) : Tile[] {
    var counts = new Map<string, number>;
    for(const tile of tiles){
        const key = tile.toString();
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    var list_of_keys = ([... counts].filter(([_, value]) => value >= 2)).map(([key, _]) => key);
    var pairs : Tile[] = [];
    for(const tile of tiles){
        const key = tile.toString();
        if(list_of_keys.includes(key)){
            pairs.push(tile);
            const index = list_of_keys.indexOf(key);
            list_of_keys.splice(index, 1);
        }
    } //string -> Tile
    return pairs;
};
function isWinningHandNoPairs(tiles : Tile[]) : boolean{
    var tiles_copy = [... tiles];
    if (tiles_copy[0] === undefined){return true;}

    var fst = tiles_copy[0];
    var nr_of_fst = tiles_copy.filter(tile => tile.compare(fst) === 0).length;
    if(nr_of_fst >=3){
        for(var i = 0; i < 3; i++){
            var index = tiles_copy.indexOf(fst);
            tiles_copy.splice(index, 1);
        }
        return isWinningHandNoPairs(tiles_copy)
    }
    if(fst.type === "honor"){return false;}
    try{
        var snd_acc = new Tile(fst.nr + 1, fst.type);
        var trd_acc = new Tile(fst.nr + 2, fst.type);
        var snd = tiles_copy.find(tile => snd_acc.compare(tile) === 0);
        var trd = tiles_copy.find(tile => trd_acc.compare(tile) === 0);
        if(snd !== undefined && trd !== undefined){
        for(var tile of [fst, snd, trd]){
            var temp_tile = tiles_copy.find( tile2 => tile2.compare(tile) === 0);
            if(temp_tile === undefined){return false;} //Absurd
            var index = tiles_copy.indexOf(temp_tile);
            tiles_copy.splice(index, 1);
        }
        }
        return isWinningHandNoPairs(tiles_copy);
    } catch (Error){}//try...catch dlatego, że tworząc nieprawidłowy Tile wywala Error

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

export function sort(tiles : Tile[]) : void{
    tiles.sort((x, y) => {
        if(x.type === y.type){
            return x.nr - y.nr;
        }
        else{
            return (x.type.localeCompare(y.type));
        }
    });
};

