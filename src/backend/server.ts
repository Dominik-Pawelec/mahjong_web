import express from "express";
import type { Request, Response } from "express";
import { Server } from "socket.io";
import { Player } from "./player";
import { Game} from "./game_logic";
import http from "http";
import path from "path"
import { Wind } from "@common/mahjonh_types";
import { ServerData } from "@common/comms";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : "http://localhost:6060",
        methods : ["GET", "POST"]
    }
});

const port = 6060;

server.listen(port, () => {
    console.log("server runs at " + port);
});

const lobby : Player[] = [];

var game : Game | undefined = undefined;

const winds : Wind[] = ["east", "south", "west", "north"];

async function sendServerData(socket : any){//TODO: make proper typing, not any
    const game_cp = game;
    const wind_turn = game_cp?.players[game_cp.turn_id]?.wind
    if(game_cp && wind_turn){
        lobby.forEach(player => {
            const serverData : ServerData = {
                table : game_cp.getTable(),
                playerTurn : wind_turn,
                playerWind : player.wind
            }
            player.socket.emit("gameState", serverData);
        });
    }
} 

//socket.io logic
io.on("connection", (socket : any) => { //TODO: make proper typing, not any
    console.log("User connected :" + socket.id);

    const new_player = new Player(winds[lobby.length - 1] as Wind, socket);
    lobby.push(new_player);
    console.log(lobby.length)
    
    if(lobby.length === 4){
        game = new Game(lobby[0],lobby[1],lobby[2],lobby[3]);
    }
    
    socket.on("choice", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        sendServerData(socket);
        player?.resolveAction(data);

    });
    socket.on("specialChoice", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        sendServerData(socket);
        player?.resolveSpecialAction(data.call);
        sendServerData(socket);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected :" + socket.id);
        const index = lobby.findIndex(p => p.socket.id === socket.id);
        if (index !== -1) lobby.splice(index, 1);
    });
});

