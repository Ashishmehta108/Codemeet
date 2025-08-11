import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "iconsax-reactjs";
import { io, Socket } from "socket.io-client";
import { Textarea } from "../components/ui/textarea";

type ChatResponse = {
  type: "init" | "chat";
  id: string;
  message?: string;
};

export default function Chat() {
  const wsRef = useRef<Socket | null>(null);
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [message, setMessage] = useState("");
  const localId = useRef<string>(crypto.randomUUID());
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastSentMessageRef = useRef<string>("");
  const [isMounted, setisMounted] = useState(false);
  useEffect(() => {
    setisMounted(true);
    return () => {
      setisMounted(false);
    };
  }, []);

  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        withCredentials: true,
        transports: ["polling", "websocket"],
      }),
    [isMounted]
  );

  useEffect(() => {
    wsRef.current = socket;

    wsRef.current.on("connect", () => console.log("Connected to WS"));
    wsRef.current.on("disconnect", () => console.log("WS disconnected"));

    wsRef.current.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    wsRef.current.io.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt #${attempt}`);
    });

    // Listen to 'message' events from server
    wsRef.current.on("message", (data: ChatResponse) => {
      if (data.type === "init") {
        localId.current = data.id;
        console.log("My ID:", data.id);
        return;
      }

      if (data.type === "chat") {
        if (
          data.id === localId.current &&
          data.message === lastSentMessageRef.current
        ) {
          return;
        }
        setChats((prev) => [...prev, data]);
      }
    });

    return () => {
      wsRef.current?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [message]);

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;

    const msg: ChatResponse = {
      type: "chat",
      id: localId.current,
      message: text,
    };
    lastSentMessageRef.current = text;

    wsRef.current?.emit("message", msg);

    setChats((prev) => [...prev, msg]);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupedMessages = chats.reduce((acc, chat, index) => {
    const isSender = chat.id === localId.current;
    const prevChat = chats[index - 1];
    const isFirstInGroup = !prevChat || prevChat.id !== chat.id;

    acc.push({ ...chat, isFirstInGroup, isSender });
    return acc;
  }, [] as Array<ChatResponse & { isFirstInGroup: boolean; isSender: boolean }>);

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200/50 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">Messages</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Real-time chat</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-zinc-600">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto">
              {chats.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">
                    No messages yet
                  </p>
                  <p className="text-zinc-400 text-xs mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {groupedMessages.map((chat, index) => {
                  const { isSender, isFirstInGroup } = chat;

                  return (
                    <div
                      key={index}
                      className={`flex items-end gap-3 ${
                        isSender ? "flex-row-reverse" : "flex-row"
                      } ${!isFirstInGroup ? "mt-1" : ""}`}
                    >
                      {isFirstInGroup && !isSender && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center shadow-sm">
                          <span className="text-xs font-semibold text-white">
                            U
                          </span>
                        </div>
                      )}
                      {!isFirstInGroup && !isSender && <div className="w-8" />}

                      <div
                        className={`group relative max-w-[75%] lg:max-w-[65%]`}
                      >
                        <div
                          className={`relative px-4 py-2.5 text-sm leading-relaxed break-words transition-all duration-200 ${
                            isSender
                              ? `bg-blue-600 text-white shadow-lg shadow-blue-600/10 ${
                                  isFirstInGroup
                                    ? "rounded-2xl rounded-tr-md"
                                    : "rounded-2xl rounded-tr-md"
                                }`
                              : `bg-white text-zinc-800 border border-zinc-200/60 shadow-sm ${
                                  isFirstInGroup
                                    ? "rounded-2xl rounded-tl-md"
                                    : "rounded-2xl rounded-tl-md"
                                }`
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{chat.message}</p>

                          <div
                            className={`absolute -bottom-6 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none ${
                              isSender ? "right-0" : "left-0"
                            }`}
                          >
                            {new Date()
                              .toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .toLowerCase()}
                          </div>
                        </div>
                      </div>

                      {isSender && <div className="w-8" />}
                    </div>
                  );
                })}
              </div>

              <div ref={lastMessageRef} className="h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-zinc-200/50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-2xl mx-auto">
            <div className={`relative transition-all duration-300`}>
              <div
                className={`flex items-end rounded-2xl border transition-all duration-300 ${
                  isFocused
                    ? "border-zinc-300 bg-white shadow-lg shadow-zinc-500/10"
                    : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
                }`}
              >
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-transparent resize-none outline-none text-sm placeholder-zinc-400 px-5 py-3.5 min-h-[48px] max-h-[150px] leading-relaxed "
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  rows={1}
                />

                <div className="p-2">
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className={`relative flex items-center cursor-pointer justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                      message.trim()
                        ? "bg-zinc-800 text-white hover:bg-zinc-700 shadow-md hover:shadow-lg "
                        : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                    }`}
                  >
                    <Send size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              {!isFocused && (
                <div className="absolute top-4.5 left-4 text-[12px] text-zinc-400" onClick={() => textareaRef.current?.focus()}>
                  Type your message and press{" "}
                  <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-500">
                    Enter
                  </kbd>{" "}
                  to send
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
