import {Call, Tile, PlayerDiscardResponse, PlayerSpecialResponse} from "./game_types";
import { allCalls } from "./game_types";
import { sameTile } from "../common/mahjonh_types";

export class Player {
    hand : Tile[];
    open_blocks : Tile[][];
    public river : Tile[];
    public points : number;
    public id: number;
    public socket : any;
    public constructor(id : number, socket : any){
        this.id = id;
        this.hand = [];
        this.open_blocks = [];
        this.river = [];
        this.points = 25000;
        this.socket = socket;
    }
    private action_resolver : any;
    private special_action_resolver : any;

    public draw(wall : Tile[]){
        let tile = wall.pop();
        if(tile != undefined){
            this.hand.push(tile);
        }
        return tile;
    }
    public discard(tile: Tile) : Tile {
        var tile_discarded = this.hand.find(x => {sameTile(x, tile, "compareRed")});
        if(tile_discarded == undefined){
            throw Error("improper discarded tile");
        }
        var tile_id = this.hand.indexOf(tile_discarded);
        this.hand.splice(tile_id, 1);
        this.river.push(tile_discarded);
        return tile_discarded;
    }
    public takeAction(tile : Tile | undefined) : Promise<PlayerDiscardResponse> {
        return new Promise((resolve) => {
            this.action_resolver = resolve;
            this.socket?.emit("your choice", tile?.toString())
        });
    };
    public takeSpecialAction(calls : Call []) : Promise<PlayerSpecialResponse> {
        return new Promise(resolve => {
            this.special_action_resolver = resolve;
            this.socket?.emit("special action", { calls });
        });
    };
    public resolveAction(tile : PlayerDiscardResponse) {
        this.action_resolver?.(tile);
        this.action_resolver = undefined;
    }

    public resolveSpecialAction(call: PlayerSpecialResponse) {
        this.special_action_resolver?.(call);
        this.special_action_resolver = undefined;
    }

    public possibleCallsOn(tile : Tile, curr_id : number) : Call [] {
        var output : Call [] = ["skip"];
        /*CHI
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
        }*/
        //PON and KAN
        var nr_of_t = this.hand.filter(x => sameTile(x, tile, "ignoreRed")).length;
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
        //if(isWinningHand(hand_copy)){
        //    output.push("ron");
        //}
        
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
        //TODO: implement later
    }

    public getIndex(tile : Tile) : number{
        var tile_from_hand = this.hand.find(x => sameTile(x, tile, "ignoreRed"));
        if(tile_from_hand === undefined){
            return -1;
        }
        return this.hand.indexOf(tile_from_hand);
    }
}