import {Call, Tile, PlayerDiscardResponse, PlayerSpecialResponse} from "./game_types";
import { allCalls } from "./game_types";
import { Block, MeldOption, PrivatePlayerData, PublicPlayerData, sameTile, Wind } from "../common/mahjonh_types";
import { PlayerResponse } from "@common/comms";
import { getAllSequences, isWinningHand } from "./hand_calculator";

export class Player {
    hand : Tile[];
    open_blocks : Block[];
    public river : Tile[];
    public points : number;
    public wind: Wind; //TODO: wind
    public socket : any;
    public name : string;
    public id : number;
    public constructor(wind : Wind, socket : any){
        this.wind = wind;
        this.hand = [];
        this.open_blocks = [];
        this.river = [];
        this.points = 25000;
        this.socket = socket;
        this.name = wind;
        this.id = ["east", "south", "west", "north"].indexOf(wind);
    }
    private action_resolver : undefined | ((res : PlayerDiscardResponse) => void) ;// : Promise<PlayerDiscardResponse> | undefined;
    private special_action_resolver: undefined | ((res : PlayerSpecialResponse) => void) ;// : Promise<PlayerSpecialResponse> | undefined;

    public draw(wall : Tile[]){
        let tile = wall.pop();
        if(tile != undefined){
            this.hand.push(tile);
        }
        return tile;
    }
    public discard(tile: Tile) : Tile {
        var tile_discarded = this.hand.find(x => sameTile(x, tile, "compareRed"));
        if(tile_discarded == undefined){
            throw Error("improper discarded tile");
        }
        var tile_id = this.hand.indexOf(tile_discarded);
        this.hand.splice(tile_id, 1);
        this.river.push(tile_discarded);
        return tile_discarded;
    }
    public takeAction(tile : Tile | undefined) : Promise<PlayerDiscardResponse> {
        this.action_resolver = undefined;
        return new Promise((resolve) => {
            this.action_resolver = resolve;
            this.socket?.emit("your choice", tile as Tile)
            
        });
    };
    public async takeSpecialAction(options : MeldOption[]) : Promise<PlayerSpecialResponse> {
        this.special_action_resolver = undefined;
        return new Promise(resolve => {
        this.special_action_resolver = resolve;
        this.socket.emit("special_action_request", options);
    });
};
    public resolveAction(tile : PlayerDiscardResponse) {
        if (!this.action_resolver) {
            console.warn("resolveAction called with no pending action", tile);
            return;
        }
        this.action_resolver(tile);
        this.action_resolver = undefined;
    }

    public resolveSpecialAction(melds: PlayerSpecialResponse) {
        if (!this.special_action_resolver) {
            console.warn("resolveSpecialAction called with no pending action", melds);
            return;
        }
        this.special_action_resolver(melds);
        this.special_action_resolver = undefined;
    }

    public possibleCallsOn(tile : Tile, wind : Wind) : MeldOption [] {
        var output : MeldOption [] = [
            {meld : "skip", blocks : []}
        ];
        
        var nr_of_t = this.hand.filter(x => sameTile(x, tile, "ignoreRed")).length;
        // KAN
        if(nr_of_t >= 3){
            output.push({
                meld : "kan",
                blocks : [{ //TODO: add kan "added"
                    kind: "kan",
                        tile: tile,
                        type : "open",
                        player: wind
                }]
            });
            output.push({
                meld : "pon", 
                blocks : [{
                    kind: "pon",
                        tile: tile,
                        player: wind
                }]
            });
        }
        // PON
        else if(nr_of_t === 2){
            output.push({
                meld : "pon", 
                blocks : [{
                    kind: "pon",
                        tile: tile,
                        player: wind
                }]
            });
        }

        // CHI
        const discarderId = ["east", "south", "west", "north"].indexOf(wind);
        const isNextPlayer = this.id === (discarderId + 1) % 4;
        console.log(discarderId, this.id);
        if (isNextPlayer) {
            const sequences = getAllSequences(this.hand, tile, this.wind);
            if (sequences.length !== 0) {
                output.push({ meld: "chi", blocks: sequences });
            }
        }
        
        
        // RON
        const hand_cp : Tile[] = JSON.parse(JSON.stringify(this.hand));
        hand_cp.push(tile);
        if(isWinningHand(hand_cp)){
            output.push({
                meld : "ron",
                blocks : []
            });
        }

        return output;
    }

    public getPublicData() : PublicPlayerData{
        return {
            discards : this.river,
            blocks : this.open_blocks,
            points : this.points,
            name : this.wind, // TODO: add valid name
            riichiIdx : 0 // TODO: add riichi
        }
    }
    public getPrivateData(recently_discarded_tile : Tile | undefined, from_wind : Wind) : PrivatePlayerData{
        if(!recently_discarded_tile){
            var meldOptions : MeldOption[] = [];
        }
        else{
            var meldOptions = this.possibleCallsOn(recently_discarded_tile, from_wind);
        }
        //console.log(this.hand.length);
        return {
            hand : this.hand,
            availableMelds : meldOptions
        }
    }

    public call(stolenTile: Tile, response: PlayerSpecialResponse) {
        const block = response.block;
        if (!block) return;

        let tilesFromHand: any[] = [];// TODO: change to factual type

        if (block.kind === "pon" || block.kind === "kan") {
            const countNeeded = block.kind === "pon" ? 2 : 3;
            tilesFromHand = this.hand
                .filter(t => sameTile(t, stolenTile, "ignoreRed"))
                .slice(0, countNeeded);
        } 
        else if (block.kind === "chi") {
            let skippedStolen = false;
            tilesFromHand = block.tiles.filter(t => {
                if (!skippedStolen && sameTile(t, stolenTile, "compareRed")) {
                    skippedStolen = true;
                    return false;
                }
                return true;
            });
        }

        tilesFromHand.forEach(target => {
            const index = this.hand.findIndex(h => sameTile(h, target, "compareRed"));
            if (index > -1) {
                this.hand.splice(index, 1);
            }
        });

        this.open_blocks.push(block);
    }



    
    public getIndex(tile : Tile) : number{
        var tile_from_hand = this.hand.find(x => sameTile(x, tile, "ignoreRed"));
        if(tile_from_hand === undefined){
            return -1;
        }
        return this.hand.indexOf(tile_from_hand);
    }
}