"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 3000 });
let socketToRoom = new Map();
let roomToSocket = new Map();
wss.on('connection', ws => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log(parsedMessage);
        if (parsedMessage.type === "join") {
            const roomId = parsedMessage.payload.roomId;
            //room already exists
            if (roomToSocket.has(roomId)) {
                //add client to room 
                const sockets = roomToSocket.get(roomId);
                sockets === null || sockets === void 0 ? void 0 : sockets.push(ws);
            }
            else { // no such room exists : first one to join room
                let sockets = [];
                sockets.push(ws);
                roomToSocket.set(roomId, sockets);
            }
            socketToRoom.set(ws, roomId);
            //send acknowledgment: 
            ws.send(JSON.stringify({
                type: "join",
                status: "success",
            }));
            console.log("acknowledgement sent!");
        }
        else if (parsedMessage.type === "chat") {
            //find the client's room 
            console.log("Chatting in progress!");
            const roomId = socketToRoom.get(ws);
            if (!roomId)
                return;
            //broadcast the message to all clients in that room 
            const sockets = roomToSocket.get(roomId);
            console.log("sockets length: ", sockets === null || sockets === void 0 ? void 0 : sockets.length);
            if (!sockets)
                return;
            for (let socket of sockets) {
                if (socket != ws) {
                    socket.send(parsedMessage.payload.message);
                }
            }
        }
        // console.log(roomToSocket); 
        // console.log(socketToRoom); 
    });
    ws.onclose = () => {
        //leave the room : 
        //find roomId: 
        const roomId = socketToRoom.get(ws);
        if (!roomId)
            return;
        //remove from socketToRoom map 
        socketToRoom.delete(ws);
        //last socket in the room
        let sockets = roomToSocket.get(roomId);
        if (!sockets)
            return;
        sockets = sockets === null || sockets === void 0 ? void 0 : sockets.filter(skt => skt != ws);
        if (sockets.length > 0) {
            roomToSocket.set(roomId, sockets);
        }
        else {
            roomToSocket.delete(roomId);
        }
        console.log("disconnection handled succesfully!");
    };
});
