import {Call, Tile, PlayerDiscardResponse, PlayerSpecialResponse} from "./game_types";
import { allCalls } from "./game_types";
import { Block, MeldOption, PrivatePlayerData, PublicPlayerData, sameTile, sortTiles, Wind } from "../common/mahjonh_types";
import { PlayerResponse } from "../common/comms";
import { getAllSequences, isInTenpai, isWinningHand } from "./hand_calculator";

export class Player {
    hand : Tile[];
    open_blocks : Block[];
    public river : Tile[];
    public points : number;
    public wind: Wind;
    public socket : any;
    public name : string;
    public id : number;
    public is_in_riichi : number | undefined;
    public recent_draw : Tile | undefined;
    public calls_riichi : boolean
    public constructor(wind : Wind, socket : any){
        this.wind = wind;
        this.hand = [];
        this.open_blocks = [];
        this.river = [];
        this.points = 25000;
        this.socket = socket;
        this.name = wind;
        this.id = ["east", "south", "west", "north"].indexOf(wind);
        this.is_in_riichi = undefined;
        this.recent_draw = undefined;
        this.calls_riichi = false;
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
        const index = this.hand.findIndex(x => sameTile(x, tile, "compareRed"));
        if (index === -1) {
            throw Error(`Error: Tile ${tile.value} not found in hand.`);
        }
        const [removedTile] = this.hand.splice(index, 1);
        this.river.push(removedTile!);
        return removedTile!;
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
    public getLegalDiscards(drawnTile?: Tile): Tile[] {
        if (this.calls_riichi) {
            const legal: Tile[] = [];
            for (let i = 0; i < this.hand.length; i++) {
                const remainingHand = [
                    ...this.hand.slice(0, i),
                    ...this.hand.slice(i + 1),
                ];

                if (isInTenpai(remainingHand)) {
                    legal.push(this.hand[i]!);
                }
            }
            return legal;
        }
        
        if (this.is_in_riichi !== undefined) {
            return drawnTile ? [drawnTile] : [];
        }

        return [...this.hand];
    }
    public resolveAction(tile : PlayerDiscardResponse) {
        if (!this.action_resolver) return;
        const legal = this.getLegalDiscards(this.recent_draw);
        const chosen = legal.find(t => sameTile(t, tile.tile, "compareRed"));

        if (!chosen) {
            this.action_resolver({kind : "discard", tile :legal[0]!});
        } else {
            this.action_resolver(tile);
        }

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
        /*const discarderId = ["east", "south", "west", "north"].indexOf(wind);
        const isNextPlayer = this.id === (discarderId + 1) % 4;
        console.log(discarderId, this.id);
        if (isNextPlayer) {
            const sequences = getAllSequences(this.hand, tile, this.wind);
            if (sequences.length !== 0) {
                output.push({ meld: "chi", blocks: sequences });
            }
        }*/
        
        
        // RON
        var totalHand : Tile[] = [...this.hand];
        totalHand.push(tile);
        totalHand = sortTiles(totalHand) as Tile[];
        console.log(totalHand);
        if(isWinningHand(totalHand)){
            output.push({
                meld : "ron",
                blocks : []
            });
        }

        console.log(output);
        return output;
    }

    public possibleCallsAfterDraw(to_wind : Wind) : MeldOption [] {
        var output : MeldOption [] = [
            {meld : "skip", blocks : []}
        ];

        if(to_wind !== this.wind){
            return output;
        }
        
        if(isWinningHand(this.hand)){
            output.push({
                meld : "tsumo",
                blocks : []
            })
        };
        
        for(let i = 0; i < this.hand.length; i++){
            const hand = [...this.hand];
            const tile = hand[i];
            if(!tile){
                continue;
            }
            if(hand.filter(t => sameTile(t, tile, "ignoreRed")).length === 4){
                output.push({
                    meld : "kan",
                    blocks : [{
                        kind: "kan",
                        tile: tile,
                        type: "closed"
                    }]
                })
            }
        }
        for (const block of this.open_blocks) {
            if (block.kind === "pon") {
                const tile = block.tile;
                if (this.hand.some(t => sameTile(t, tile, "ignoreRed"))) {
                    output.push({
                        meld: "kan",
                        blocks: [{
                            kind: "kan",
                            tile : tile,
                            type: "added",
                            player : block.player
                        }]
                    });
                }
            }
        }
        if(isInTenpai(this.hand)){
            output.push({
                meld: "riichi",
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
            riichiIdx : undefined, // TODO: add riichi
        }
    }
    public getPrivateData(recently_discarded_tile : Tile | undefined, from_wind : Wind, to_wind : Wind) : PrivatePlayerData{
        var outHand;
        if(to_wind !== this.wind){
            outHand = Array(this.hand.length).fill({kind : "closed"});
        }
        else{
            outHand = this.hand;
        }
        if(!recently_discarded_tile){
            if(this.wind === from_wind){
                var meldOptions : MeldOption[] = this.possibleCallsAfterDraw(to_wind); // TODO: add check for being your turn
            }
            else{
                var meldOptions : MeldOption[] = [];
            }
        }
        else{
            var meldOptions : MeldOption[] = this.possibleCallsOn(recently_discarded_tile, from_wind);
        }
        //console.log(this.hand.length);
        return {
            hand : outHand,
            availableMelds : meldOptions
        }
    }

    public call(stolenTile: Tile, response: PlayerSpecialResponse) {
        const block = response.block;
        if (!block) return;

        let tilesFromHand: any[] = [];// TODO: change to factual type

        if (block.kind === "pon" || (block.kind === "kan" && block.type === "open")) {
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
        else if (block.kind === "kan" && block.type === "added") {
            const index = this.hand.findIndex(t => sameTile(t, block.tile, "ignoreRed"));
            if (index > -1) this.hand.splice(index, 1);

            const ponIndex = this.open_blocks.findIndex(
                b => b.kind === "pon" && sameTile(b.tile, block.tile, "ignoreRed")
            );
            if (ponIndex > -1) {
                this.open_blocks[ponIndex] = block;
            }
        }

        tilesFromHand.forEach(target => {
            const index = this.hand.findIndex(h => sameTile(h, target, "compareRed"));
            if (index > -1) {
                this.hand.splice(index, 1);
            }
        });

        this.open_blocks.push(block);
    }

    public reset(wind : Wind){
        this.wind = wind;
        this.hand = [];
        this.open_blocks = [];
        this.river = [];
        this.id = ["east", "south", "west", "north"].indexOf(wind);
        this.is_in_riichi = undefined;
    }

}
