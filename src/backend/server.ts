import express from "express";
import type { Request, Response } from "express";
import { Server } from "socket.io";
import { Player } from "./player";
import { Round, startGame} from "./game_logic";
import http from "http";
import path from "path"

const app = express();
const server = http.createServer(app);

const io = new Server(server, {cors : {origin:""}});

const port = 6060;
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '../../views'));


app.get("/game", (req : Request, res : Response) => {
    res.render("game");
});

server.listen(port, () => {
    console.log("server runs at " + port);
});

const lobby : Player[] = [];

var round : Round | undefined = undefined;

//socket.io logic
io.on("connection", (socket : any) => { //TODO: make proper typing, not any
    console.log("User connected :" + socket.id);

    const new_player = new Player(lobby.length, socket);
    lobby.push(new_player);
    
    if(lobby.length === 4){
        round = new Round(0, [...lobby] as [Player, Player, Player, Player]);
        const state = round?.visibleToString()
        if(round){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {state, player_hand});
            });
        }
        startGame(round);
    }
    
    socket.on("choice", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        const state = round?.visibleToString()
        if(round){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {state, player_hand});
            });
        }
        player?.resolveAction(data);
        if(round){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {state, player_hand});
            });
        }
    });
    socket.on("specialChoice", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        const state = round?.visibleToString()
        if(round){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {state, player_hand});
            });
        }
        player?.resolveSpecialAction(data.call);
        if(round){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {state, player_hand});
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected :" + socket.id);
        const index = lobby.findIndex(p => p.socket.id === socket.id);
        if (index !== -1) lobby.splice(index, 1);
    });
});

