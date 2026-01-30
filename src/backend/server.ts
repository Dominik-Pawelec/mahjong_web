import express from "express";
import type { Request, Response } from "express";
import { Server } from "socket.io";
import { Player } from "./player";
import { Game} from "./game_logic";
import http from "http";
import path from "path"

console.log("FILE EXECUTED");

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

var game : Game | undefined = undefined;


//socket.io logic
io.on("connection", (socket : any) => { //TODO: make proper typing, not any
    console.log("User connected :" + socket.id);

    const new_player = new Player(lobby.length, socket);
    lobby.push(new_player);
    
    if(lobby.length === 4){
        game = new Game(lobby[0],lobby[1],lobby[2],lobby[3]);
    }
    
    socket.on("choice", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        if(game){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {game, player_hand});
            });
        }
        player?.resolveAction(data);
        if(game){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {game, player_hand});
            });
        }
    });
    socket.on("specialChoice", async (data : any) => {
        const player = lobby.find(p => p.socket.id === socket.id);
        if(game){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {game, player_hand});
            });
        }
        player?.resolveSpecialAction(data.call);
        if(game){
            lobby.forEach(player => {
                const player_hand = player.toString();
                player.socket.emit("gameState", {game, player_hand});
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected :" + socket.id);
        const index = lobby.findIndex(p => p.socket.id === socket.id);
        if (index !== -1) lobby.splice(index, 1);
    });
});

