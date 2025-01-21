import React, { useEffect, useRef, useState } from 'react'
import ChatBox from './ChatBox';

const Room = () => {
    const [chatStatus, setChatStatus] = useState(false); 
    const [wsopen, setWsOpen] = useState(false); 
    const wsRef = useRef<WebSocket|null>(null); 
    const roomRef = useRef<HTMLInputElement>(null); 
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3000'); 
        wsRef.current = ws; 
        ws.onopen = ()=>{
            setWsOpen(true); 
        }
        ws.onmessage = (event)=>{
            const parsedMsg = JSON.parse(event.data); 
            if(parsedMsg.type === "join"  && parsedMsg.status === "success"){ 
                setChatStatus(true); 
            }
        }
    }, [])
    function enterRoomHandler() {
        const roomId = roomRef.current?.value; 
        if(roomId && roomId.length > 0) {
            if(wsRef.current)
            {
                wsRef.current.send(JSON.stringify({
                    type:"join", 
                    payload:{
                        roomId: roomId
                    }
                })) 

            }           
        }
        else{
            alert("Please enter a room Id"); 

        }
    }
    if(!wsopen){
        return(
            <div className="text-white">
                Establishing Connection ... 
            </div>
        )
    }
    else
    {return (
     
        chatStatus === false?<div className="flex flex-col gap-2 items-center justify-center w-80 h-96 border border-white relative top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] rounded-lg">
            <h1 className="mt-6 text-center text-2xl top-0 absolute text-white"> Enter a room or create your own!</h1>
            <div className="w-[95%] flex flex-col justify-center items-center gap-2  ">

                <div className="flex justify-center gap-3 w-full border-white ">
                    <input ref = {roomRef} type="text" className="rounded-lg border border-white p-1" placeholder="Room Id" />
                    <button onClick={enterRoomHandler} className="hover:bg-white hover:text-black text-white rounded-lg bg-black border border-white px-4 py-2">Enter</button>
                </div>
                <div className="hover:bg-white hover:text-black text-center w-full px-4 py-2 rounded-lg text-2xl  text-white border-white border cursor-pointer">
                    Create New Room
                </div>
            </div>
        </div>:
        <ChatBox wsRef={wsRef}/>

  )}
}

export default Room