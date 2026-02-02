import { NONAME } from "dns";
import { Call, Tile } from "./game_types";
import { Meld, sortTiles, Table, Wind } from "../common/mahjonh_types";
import { generate_all_tiles } from "./game_types";
import { Player } from "./player";
import {PlayerSpecialResponse} from "./game_types"
import { ServerData } from "../common/comms";
import { forEachChild } from "typescript";
import { calculatePayout } from "./scoring";

export class Round {
    players : [Player, Player, Player, Player];
    wall : Tile[];
    recently_discarded_tile : Tile | undefined;
    public constructor(public turn_id : number, players : [Player, Player, Player, Player]){ //TODO: make it take not-new players
        this.players = players;
        this.wall = generate_all_tiles(4)//generate_all_tiles().sort((x, y) => Math.random() - 0.5); //TODO: change to be factually random, this one is biased
        if(this.wall.length === 0){
            throw Error("Invalid wall");
        }
        for(var player of this.players){
            for(let i = 0; i < 13; i++)
                player.draw(this.wall);
        }
        
    }

    public async main_loop() {
        let needsDraw = true;
        console.log("aaa")
        while (this.wall.length > 14) {
            const player = this.players[this.turn_id];
            if (!player) break;
            await this.onStateChange();
            let drawnTile: Tile | undefined = undefined;
            if(needsDraw) {
                drawnTile = player.draw(this.wall);
                player.recent_draw = drawnTile;
                await this.onStateChange();

                const afterDrawOptions = player.possibleCallsAfterDraw(player.wind);
                if (afterDrawOptions.length > 1) {
                    const special = await player.takeSpecialAction(afterDrawOptions);

                    if(special.meld === "tsumo") {
                        await this.handleWin(player, {win:"tsumo"});
                        await this.onStateChange();
                        return;
                    }

                    if(special.meld === "kan" && special.block) {
                        player.call(drawnTile as Tile, special);

                        drawnTile = player.draw(this.wall);
                        needsDraw = false;
                        await this.onStateChange();
                    }

                    if(special.meld === "riichi"){
                        player.calls_riichi = true;
                    }
                }
            }

            console.log(`Waiting for Player ${this.turn_id}...`);
            var discarded;
            if(player.is_in_riichi === undefined){
                const action = await player.takeAction(drawnTile);
                discarded = player.discard(action.tile);
            }
            else{
                discarded = player.discard(drawnTile!); // Will not be able to discard outside of drawing when in riichi
            }
            this.recently_discarded_tile = discarded;
                

            await this.onStateChange();

            const callResult = await this.check_for_calls(player, discarded);
            this.recently_discarded_tile = undefined;

            if (callResult) {
                if (callResult.meldType === "ron"){
                    const winner = this.players[callResult.playerIndex];
                    await this.handleWin(winner!, {win: "ron", wind : player.wind});
                    await this.onStateChange();
                    return;
                };
                this.turn_id = callResult.playerIndex;
                needsDraw = (callResult.meldType === "kan");
            } else {
                this.turn_id = (this.turn_id + 1) % 4;
                needsDraw = true;
            }
            
            await this.onStateChange(); 
        }
    }

    private async check_for_calls(discarder: Player, tile: Tile) {
        const actions: Promise<{id: number; action: PlayerSpecialResponse}>[] = [];

        for (const p of this.players) {
            if (p.id === discarder.id) continue;

            const isNextPlayer = (this.turn_id + 1) % 4 === p.id;

            const choices = p.possibleCallsOn(tile, discarder.wind);

            //if (!isNextPlayer)   {
            //    choices = choices.filter(choice => choice.meld !== "chi");
            //}

            if (choices.length > 1) {
                actions.push(
                    p.takeSpecialAction(choices).then(a => ({ id: p.id, action: a }))
                );
            }
        }

        if (actions.length > 1) return null;
        console.log(`Awaiting calls from players: ${actions.length}`);
        const results = await Promise.all(actions);
        console.log("All players responded");
        const priorityMap: Record<string, number> = { "ron": 3, "kan": 2, "pon": 2, "chi": 1, "skip": 0 };

        let best = results[0] as {id : number, action: PlayerSpecialResponse};
        for (const current of results) {
            const currentPriority = priorityMap[current.action.meld] ?? 0;
            const bestPriority = priorityMap[best.action.meld] ?? 0;

            if (currentPriority > bestPriority) {
                best = current;
            }
        }

        if (!best || best.action.meld === "skip") return null;

        const caller = this.players[best.id];
        if (!caller) {
            console.error(`Player with ID ${best.id} not found.`);
            return null;
        }

        if (best.action.meld !== "ron") {
            if (discarder.river.length > 0) {
                discarder.river.pop();
            }
            caller.call(tile, best.action);
        }

        return { playerIndex: best.id, meldType: best.action.meld };
    }


    private getTable(to_wind : Wind) : Table {
        const thisRoundWind = this.players[this.turn_id]?.wind as Wind;
        return {
            roundWind: "east",
            doraIndicators: [],
            tilesLeft :this.wall.length - 14,
            ...this.players.reduce(
            (acc, player) => {
                acc[player.wind] = {
                    publicData : player.getPublicData(),
                    privateData : player.getPrivateData(this.recently_discarded_tile, thisRoundWind, to_wind),
                    name : player.name,
                    points : player.points
                };
                return acc
            },{} as Table extends infer T 
                ? T extends {[K in Wind] : infer V}
                    ? {[K in Wind] : V}
                    : never
                : never
            )
        }
    }

    private async onStateChange(){
        const wind_turn = this.players[this.turn_id]?.wind;
        if(wind_turn){
            this.players.forEach(player => {
                const serverData : ServerData = {
                    table : this.getTable(player.wind),
                    playerTurn : wind_turn,
                    playerWind : player.wind
                }
                player.socket.emit("server_packet", serverData);
            });
        }
    }

    private async handleWin(player : Player, win_by : {win: "tsumo"} | {win: "ron", wind : Wind}){
        console.log(`${player.wind} wins by ${win_by}`);

        const payout = calculatePayout(player.hand, player.open_blocks, player.wind, "east", win_by.win);

        // point calculation
        if(win_by.win === "tsumo"){
            for (const player2 of this.players){
                if(player.wind !== player2.wind){
                    player.points += payout;
                    player2.points -= payout;
                }
            }
        }
        else{
            for (const player2 of this.players){
                if(player2.wind === win_by.wind){
                    player.points += payout;
                    player2.points -= payout;
                }
            }
        }
        await this.onStateChange();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

export class Game {
    players : [Player, Player, Player, Player];
    is_running : boolean;
    turn_id : number;
    round : Round | undefined;

    public constructor(players : [Player, Player, Player, Player]){
        this.players = players//[new Player("east", s0), new Player("south", s1), new Player("west", s2), new Player("north", s3)];
        this.is_running = false;
        this.turn_id = 0;
        console.log("the game has sarted");
        this.run();
    }
    private async run(){
        this.is_running = true;
        while(this.is_running && this.turn_id < 4){
            console.log("round started");
            this.round = new Round(this.turn_id, this.players);
            await this.round.main_loop();
            console.log("round ended");
            const list : Wind[] = ["east", "south", "west", "north"];
            for(let i = 0; i < 4; i++){
                const nextWind = list[(list.indexOf(this.players[i]!.wind) +3) % 4];
                this.players[i]!.reset(nextWind!);
            }
            this.turn_id++;
        }
    } 
}
