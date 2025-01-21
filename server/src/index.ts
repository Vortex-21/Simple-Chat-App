import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
const wss = new WebSocketServer({ port: 3000 });



let socketToRoom: Map<WebSocket,string> = new Map(); 
let roomToSocket: Map<string,Array<WebSocket>> = new Map(); 


wss.on('connection', ws => {
    ws.on('message',( message:string )=> {
        const parsedMessage = JSON.parse(message);
        console.log(parsedMessage)
        if(parsedMessage.type === "join"){ 
            const roomId = parsedMessage.payload.roomId;

            //room already exists
            if(roomToSocket.has(roomId)){
                
                //add client to room 
                const sockets = roomToSocket.get(roomId); 
                sockets?.push(ws);
                
            }
            else{ // no such room exists : first one to join room
                let sockets:Array<WebSocket> = []; 
                sockets.push(ws);
                roomToSocket.set(roomId, sockets); 
            }
            socketToRoom.set(ws, roomId); 


            //send acknowledgment: 
            ws.send(JSON.stringify({
                type:"join", 
                status:"success",
            }))
            console.log("acknowledgement sent!")
        }
        else if(parsedMessage.type === "chat"){
            //find the client's room 
            console.log("Chatting in progress!")
            const roomId = socketToRoom.get(ws); 
            if(!roomId)return; 

            //broadcast the message to all clients in that room 
            const sockets = roomToSocket.get(roomId); 
            console.log("sockets length: ", sockets?.length); 
            if(!sockets)return; 

            for(let socket of sockets){
                if(socket!=ws){
                    socket.send(parsedMessage.payload.message); 
                }
            }

            
        }
        // console.log(roomToSocket); 
        // console.log(socketToRoom); 
    })

    ws.onclose = ()=>{
        //leave the room : 

        //find roomId: 
        const roomId = socketToRoom.get(ws);
        if(!roomId)return;  
        //remove from socketToRoom map 
        socketToRoom.delete(ws); 

        //last socket in the room
        let sockets = roomToSocket.get(roomId); 
        if(!sockets)return;  

        sockets = sockets?.filter(skt => skt!=ws); 
        if(sockets.length > 0){
            roomToSocket.set(roomId, sockets); 
        }
        else{
            roomToSocket.delete(roomId); 
        }


        console.log("disconnection handled succesfully!"); 
        

        

    }
})
