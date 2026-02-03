import { Server } from "socket.io";
import express from "express";
import cookieParser from 'cookie-parser';
import http from "http";

import { Room } from "./room";
import { User } from "./user";
import { Game } from "./game_logic";
import { Wind } from "@common/mahjonh_types";

const app = express();
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
export const io = new Server(server, {
    cors : {
        origin : "http://localhost:5173",
		credentials: true,
    },
	transports : ["websocket"],
});

const port = 6060;

server.listen(port, () => {
    console.log("server runs at " + port);
});

export const winds : Wind[] = ["east", "south", "west", "north"];

export const rooms = new Map<string, Room>();
export const users = new Map<string, User>();
export const games = new Map<string, Game>();
