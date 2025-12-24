import {Call, Tile} from "./game_types";
import {generate_all_tiles, sort} from "./game_types";
import {Player} from "./player";

class Round {
    players : [Player, Player, Player, Player];
    wall : Tile[];
    public constructor(public turn_id : number){ //TODO: make it take not-new players
        this.players = [new Player(0,"0"), new Player(1,"1"), new Player(2,"2"), new Player(3,"3")];
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
    public visibleToString() : string{
        var output = "";
        for(let player of this.players){
            
            output += "Player" + player.id + "\n";
            output += "discard: \n" + player.discard + "\n";
            output += "open blocks: \n" + player.open_blocks;
            output += "\n";
        }
        return output;
    }

    public async main_loop(){
        while(this.wall.length > 14){
            await this.turn(true);
            this.turn_id = (this.turn_id + 1) % 4;
        }
    }
}

(async () => {
    var game = new Round(0);
    await game.main_loop();
})()
