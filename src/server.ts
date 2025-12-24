const express = require("express");
import { Socket } from "dgram";
import type { Request, Response } from "express";

const http = require("http");
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);

const port = 6060;
app.set("view engine", "ejs");


app.get("/game", (req : Request, res : Response) => {
    res.render("game");
});

server.listen(port, () => {
    console.log("server runs at " + port);
});


//socket.io logic
io.on("connection", (socket : any) => { //TODO: make proper typing, not any
    console.log("User connected :" + socket.id);

    socket.on("choice", (data : any) => {
        console.log(data);
        socket.broadcast.emit("choice", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected :" + socket.id);
    });
});

