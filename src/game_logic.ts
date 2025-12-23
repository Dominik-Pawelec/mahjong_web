import assert = require("assert");
import ts = require("typescript");

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
type ID = 0 | 1 | 2 | 3 ;

class Player {
    hand : Tile[];
    open_blocks : Tile[][];
    public river : Tile[];
    public points : number;
    public id: ID;
    public constructor(id : ID){
        this.id = id;
        this.hand = [];
        this.open_blocks = [];
        this.river = [];
        this.points = 25000;
    }
    public draw(wall : Tile[]){
        let tile = wall.pop();
        if(tile != undefined){
            this.hand.push(tile);
        }
    }
    public discard(tile_id : number) : Tile{
        var tile_discarded = this.hand[tile_id];
        this.hand.splice(tile_id, 1);
        if(tile_discarded === undefined){
            throw Error("improper discarded tile");
        }
        this.river.push(tile_discarded);
        return tile_discarded;
    }
    public takeAction() : Promise<number> {
        return new Promise((resolve) => {
            rl.question(this.toString() + "\n 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13\n", (tile_id : number) => {
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

    public toString() : string {
        var output = "Player id: " + this.id.toString() + "\nriver:";
        var counter = 0;
        for(let tile of this.river){
            if(counter%6 === 0 && counter < 18){ output += "\n"; }
            output += tile.toString() + "|";
            counter++;
        }
        output += "\nhand:\n"
        for(let tile of this.hand){
            output += tile.toString() + "|";
        }
        output += "   blocks:[";
        for(let block of this.open_blocks){
            output += block.toString() + "][";
        }
        output += "]";

        return output;
    }
    public call(tile : Tile, call : Exclude<Call, "skip">){
        let nr = tile.nr;
        let type = tile.type;
        switch (call){
            case "chi":
                console.log("Chi is not implemented yet");
                break;
            case "pon":
                for(let i = 0; i < 2; i++){
                    let index = this.getIndex(tile);
                    if(index === -1){
                        //TODO; proper handle
                        console.log("improper Pon");
                        break;
                    }
                    this.hand.splice(index, 1);
                }
                this.open_blocks.push([new Tile(nr, type), new Tile(nr, type), new Tile(nr ,type)]);
                break;
            case "kan":
                for(let i = 0; i < 3; i++){
                    let index = this.getIndex(tile);
                    if(index === -1){
                        //TODO; proper handle
                        console.log("improper Kan");
                        break;
                    }
                    this.hand.splice(index, 1);
                }
                this.open_blocks.push([new Tile(nr, type), new Tile(nr, type), new Tile(nr, type), new Tile(nr ,type)]);
                break;
            case "ron":
                console.log("Ron is not implemented yet");
                break;
            case "tsumo":
                console.log("Tsumo is not implemented yet");
                break;
        }
    }

    public getIndex(tile : Tile) : number{
        var tile_from_hand = this.hand.find(x => x.compare(tile) === 0);
        if(tile_from_hand === undefined){
            return -1;
        }
        return this.hand.indexOf(tile_from_hand);
    }
}

class Round {
    players : [Player, Player, Player, Player];
    wall : Tile[];
    public constructor(public turn_id : number){ //TODO: make it take not-new players
        this.players = [new Player(0), new Player(1), new Player(2), new Player(3)];
        this.wall = generate_all_tiles().sort((x, y) => Math.random() - 0.5); //TODO: change to be factually random, this one is biased
        if(this.wall.length === 0){
            throw Error("Invalid wall");
        }
        for(var player of this.players){
            for(let i = 0; i < 13; i++)
                player.draw(this.wall);
        }
    }
    public async handle_discard(player : Player, tile_discarded : Tile){
        console.log("handling");
        console.log(tile_discarded);
        if(tile_discarded === undefined){return;}//TODO: implement better logic
        var players_actions : Call [] = ["skip","skip","skip","skip"];
        for(let player2 of this.players){//TODO: make async(when gui will be workig correctly)
            console.log(player2.id);
            if(player.id === player2.id){continue;}
            var calls = player2.possibleCallsOn(tile_discarded, player.id);
            console.log(player2.toString());
            console.log("Possible calls: " + calls);
            if(calls.length === 1){continue;} //only "skip"
            var action = await player2.takeSpecialAction(calls);
            players_actions[player2.id] = action;
        }
        console.log(players_actions);
        if(players_actions.some(action => action.localeCompare("skip") !== 0)){
            
            var winners : Player [] = [];
            for(let player2 of this.players){
                if(players_actions[player2.id]?.localeCompare("ron") === 0){
                    winners.push(player2);
                }
            }
            if(winners.length !== 0){ //TODO: proper handling of win
                console.log("WYGRANA");
            }
            
            var pon = players_actions.findIndex(x => x.localeCompare("pon") === 0);
            const pon_player = this.players[pon]; 
            if(pon_player !== undefined){
                console.log("PON");
                this.turn_id = pon_player.id;
                //handle pon
                player.river.pop();
                pon_player.call(tile_discarded, "pon");
                await this.turn(false);
            }
            var kan = players_actions.findIndex(x => x.localeCompare("kan") === 0);
            const kan_player = this.players[kan]; 
            if(kan_player !== undefined){
                console.log("KAN");
                this.turn_id = kan_player.id;
                //handle kan
                player.river.pop();
                kan_player.call(tile_discarded, "kan");
                await this.turn(false);
            }
            var chi = players_actions.findIndex(x => x.localeCompare("chi") === 0);
            const chi_player = this.players[chi]; 
            if(chi_player !== undefined){
                console.log("CHI");
                this.turn_id = chi_player.id;
                //handle chi
            }
            var tile_id = await player.takeAction();
            var tile_discarded2 = player.discard(tile_id);
            await this.handle_discard(player, tile_discarded2);
        }
    }
    public async turn(draw : boolean){
        const player = this.players[this.turn_id];
        if(player != undefined){ 
            sort(player.hand);
            if(draw){
                player.draw(this.wall);
            }
            var tile_id = await player.takeAction();
            var tile_discarded = player.discard(tile_id);
            console.log(tile_discarded);
            var handle = await this.handle_discard(player, tile_discarded);
        }
    }

    public async main_loop(){
        while(this.wall.length > 14){
            await this.turn(true);
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
