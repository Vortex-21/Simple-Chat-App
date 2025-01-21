import React, { useEffect, useRef, useState } from "react";

interface msgInterface {
  source: string;
  message: string;
}
const ChatBox = ({ wsRef }: { wsRef: React.RefObject<WebSocket | null> }) => {
  const [messages, setMessages] = useState<msgInterface[]>([
    { source: "sent", message: "First sent message!" },
    { source: "recieved", message: "First Received message!" },
  ]);
  const messageRef = useRef<HTMLInputElement>(null);
  const chatsRef = useRef<HTMLDivElement>(null); 
  function sendMessageHandler() {
    const message = messageRef.current?.value;
    if (message) {
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: "chat",
            payload: {
              message: message,
            },
          })
        );
        messageRef.current.value = "";
        setMessages((prev: msgInterface[]) => {
          return [...prev, { source: "sent", message: message }];
        });
      } else {
        alert("Ws Connection not present!");
      }
    }
  }
  useEffect(() => {
    if(chatsRef && chatsRef.current)chatsRef.current.scrollTo({top:chatsRef.current.scrollHeight, behavior:"smooth"}); 
  }, [messages])
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = (event) => {
        setMessages((prev: msgInterface[]) => {
          return [...prev, { source: "recieved", message: event.data }];
        });
      };
    } else {
      alert("ws is not defined!");
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="h-[95%] bg-black overflow-y-scroll p-2 flex flex-col gap-2 scroll-auto" ref={chatsRef}>
        {/* lorem*300 */}
        {messages.map((msg: msgInterface, idx: number) => {
          if (msg.source === "sent") {
            return (
              <p
                key={idx}
                className="bg-white text-black rounded-lg px-4 py-2 ml-auto max-w-full w-fit h-fit whitespace-pre-wrap break-words"
              >
                {msg.message}
              </p>
            );
          } else {
            return (
              <div
                key={idx}
                className="bg-white text-black rounded-lg px-4 py-2 max-w-full w-fit break-words"
              >
                {msg.message}
              </div>
            ); // recieved message
          }
        })}
      </div>
      <div className="flex-1 flex bg-black p-2">
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessageHandler();
            }
          }}
          ref={messageRef}
          className="p-2 w-[90%] rounded-lg"
          placeholder="Message"
        />
        <button
          onClick={sendMessageHandler}
          className="flex-1 border border-black rounded-lg bg-white text-black ml-1 mr-1"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
