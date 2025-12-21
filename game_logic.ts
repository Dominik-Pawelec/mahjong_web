import assert = require("assert");

const readline = require("readline");
const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
});

type TileColor = "man" | "pin" | "sou" | "honor";
const tileColors : TileColor[] = ["man", "pin", "sou", "honor"]

class Tile{
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
function generate_all_tiles() : Tile[] {
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
function isWinningHand(tiles : Tile[]) : boolean{
    var tiles_copy = [... tiles];
    sort(tiles_copy);

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
    const pairs = getPairs(tiles_copy);
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

function sort(tiles : Tile[]) : void{
    tiles.sort((x, y) => {
        if(x.type === y.type){
            return x.nr - y.nr;
        }
        else{
            return (x.type.localeCompare(y.type));
        }
    });
};



type Call = "skip" | "chi" | "pon" | "kan" | "ron" | "tsumo";
const allCalls : Call[] = ["skip","chi", "pon", "kan", "ron", "tsumo"]

class Player {
    hand : Tile[];
    public river : Tile[];
    public points : number;
    public id: number;
    public constructor(id : number){
        this.id = id;
        this.hand = [];
        this.river = [];
        this.points = 25000;
    }
    public draw(wall : Tile[]){
        let tile = wall.pop();
        if(tile != undefined){
            this.hand.push(tile);
        }
    }
    public discard(tile_id : number){
        var tile_discarded = this.hand[tile_id];
        this.hand.splice(tile_id, 1);
        if(tile_discarded != undefined){
            this.river.push(tile_discarded);
        }
        return tile_discarded;
    }
    public takeAction() : Promise<number> {
        return new Promise((resolve) => {
            rl.question(this.hand.toString() + "\n 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13\n", (tile_id : number) => {
                //TODO: validate size of a hand
                resolve (Number (tile_id));
            });
        });
    }
    public takeSpecialAction(calls : Call []) : Promise<Call> {
        return new Promise((resolve) => {
            rl.question(calls.toString(), (nr : number) => {
                const val = calls[nr];
                if(val === undefined){return resolve("skip");}
                if(!allCalls.includes(val)){return resolve("skip");}
                return resolve(val);
            });
        });
    }
    public possibleCallsOn(tile : Tile, curr_id : number) : Call [] {
        var output : Call [] = ["skip"];
        //CHI
        if((curr_id + 1) % 4 === this.id){
            try{
                var m2 = new Tile(tile.nr - 2, tile.type);
                var m1 = new Tile(tile.nr - 1, tile.type);
                var p1 = new Tile(tile.nr + 1, tile.type);
                var p2 = new Tile(tile.nr + 2, tile.type);
                if(
                    (this.hand.some(t => m2.compare(t)===0) && this.hand.some(t => m1.compare(t)===0) )||
                    (this.hand.some(t => m1.compare(t)===0) && this.hand.some(t => p1.compare(t)===0) )||
                    (this.hand.some(t => p1.compare(t)===0) && this.hand.some(t => p2.compare(t)===0) )
                ){
                    output.push("chi");  
                }
            } catch (Error){}
        }
        //PON and KAN

        var nr_of_t = this.hand.filter(x => x.compare(tile) === 0).length;
        console.log(nr_of_t)
        if(nr_of_t >= 3){
            output.push("kan");
            output.push("pon");
        }
        else if(nr_of_t === 2){
            output.push("pon");
        }
        
        //WIN
        var hand_copy = [... this.hand];
        hand_copy.push(tile);
        if(isWinningHand(hand_copy)){
            output.push("ron");
        }
        
        return output;
    }
}

class Round {
    players : [Player, Player, Player, Player];
    wall : Tile[];
    public constructor(public turn_id : number){ //TODO: make it take not-new players
        this.players = [new Player(0), new Player(1), new Player(2), new Player(3)];
        this.wall = generate_all_tiles().sort((x, y) => Math.random() - 0.5);
        if(this.wall.length === 0){
            throw Error("Invalid wall");
        }
        for(var player of this.players){
            for(let i = 0; i < 13; i++)
                player.draw(this.wall);
        }
    }

    public async turn(){
        const player = this.players[this.turn_id];
        if(player != undefined){ 
            sort(player.hand);
            player.draw(this.wall);
            console.log("DRAWN BY", this.turn_id);
            var tile_id = await player.takeAction();
            var tile_discarded = player.discard(tile_id);
            if(tile_discarded != undefined){//TODO: implement better logic
                for(let player2 of this.players){
                    if(player.id !== player2.id){
                        var calls = player2.possibleCallsOn(tile_discarded, player.id);
                        //TODO: implement better logic
                        console.log(player2)
                        console.log("Possible calls: " + calls);
                    }
                }
            }
        }
    }

    public async main_loop(){
        while(this.wall.length > 14){
            await this.turn();
            this.turn_id = (this.turn_id + 1) % 4;
        }
    }
}
/*
var test = [new Tile(1, "man"),new Tile(2, "man"),new Tile(1, "man"),new Tile(3, "man"),new Tile(1, "man")];
var x = isWinningHand(test);
console.log(x);
console.log(isWinningHand([]));*/

(async () => {
    var game = new Round(0);
    await game.main_loop();
    rl.close();
})()
