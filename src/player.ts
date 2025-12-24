import {Call, Tile} from "./game_types";
import {isWinningHand, allCalls} from "./game_types";


const readline = require("readline");
const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
});


export class Player {
    hand : Tile[];
    open_blocks : Tile[][];
    public river : Tile[];
    public points : number;
    public id: number;
    public socket_id : string;
    public constructor(id : number, socket_id : string){
        this.id = id;
        this.hand = [];
        this.open_blocks = [];
        this.river = [];
        this.points = 25000;
        this.socket_id = socket_id;
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