import { NONAME } from "dns";
import { Call, Tile } from "./game_types";
import { Meld, sortTiles, Table, Wind } from "../common/mahjonh_types";
import { generate_all_tiles } from "./game_types";
import { Player } from "./player";
import {PlayerSpecialResponse} from "./game_types"
import { ServerData } from "@common/comms";
import { forEachChild } from "typescript";

export class Round {
    players : [Player, Player, Player, Player];
    wall : Tile[];
    recently_discarded_tile : Tile | undefined;
    public constructor(public turn_id : number, players : [Player, Player, Player, Player]){ //TODO: make it take not-new players
        this.players = players;
        this.wall = generate_all_tiles().sort((x, y) => Math.random() - 0.5); //TODO: change to be factually random, this one is biased
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

        while (this.wall.length > 14) {
            const player = this.players[this.turn_id];
            if (!player) break;

            let drawnTile: Tile | undefined = undefined;
            if (needsDraw) {
                drawnTile = player.draw(this.wall);
            }


            await this.onStateChange(); 




            console.log(`Waiting for Player ${this.turn_id}...`);
            const action = await player.takeAction(drawnTile);
            
            const discarded = player.discard(action.tile);
            this.recently_discarded_tile = discarded;
            
            await this.onStateChange();

            const callResult = await this.check_for_calls(player, discarded);
            this.recently_discarded_tile = undefined;

            if (callResult) {
                if (callResult.meldType === "ron") return;
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


    private getTable() : Table {
        const thisRoundWind = this.players[this.turn_id]?.wind as Wind;
        return {
            roundWind: "east", //FIX: To ma być wiatr rundy, a nie wiatr gracza którego runda to jest
            doraIndicators: [],
            tilesLeft :this.wall.length - 14,
            ...this.players.reduce(
            (acc, player) => {
                acc[player.wind] = {
                    publicData : player.getPublicData(),
                    privateData : player.getPrivateData(this.recently_discarded_tile, thisRoundWind),
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
                table : this.getTable(),
                playerTurn : wind_turn,
                playerWind : player.wind
            }
            player.socket.emit("server_packet", serverData);
        });
    }

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
            this.round = new Round(this.turn_id, this.players);
            await this.round.main_loop();
            this.turn_id ++;
        }
    }
/*
export type Table = {
    roundWind: Wind;
    doraIndicators: Tile[];
    tilesLeft: number;
} & {
    [P in Wind]: {
        publicData: PublicPlayerData;
        privateData: PrivatePlayerData;
        name: string;
        points: number;
    }
}
 */
    
}

/*
(async () => {
    var game = new Round(0, [new Player(0,"0"), new Player(1,"1"), new Player(2,"2"), new Player(3,"3")]);
    await game.main_loop();
})()*/
