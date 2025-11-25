import { Socket as ClientSocket } from "socket.io-client";
import { createContext, use } from "react";
import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { useAuthToken } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Id } from "@packages/backend/dataModel";
import {
  ROOM_FULL_PAYLOAD,
  type MESSAGE_RECEIVE_PAYLOAD,
  type MESSAGE_SEND_PAYLOAD,
  WEBSOCKET_EVENTS,
} from "@packages/websocket/events";
import { useRouter } from "expo-router";
export interface Message {
  authorId: Id<"users">;
  content: string;
}
interface ChatProviderValue {
  socket: ClientSocket | undefined;
  roomStart: boolean;
  messages: MESSAGE_RECEIVE_PAYLOAD[];
}

export const ChatContext = createContext<ChatProviderValue | undefined>(
  undefined
);
export const ChatProvider: React.FC<{
  children: React.ReactNode;
  chatId: string;
}> = ({ children, chatId }) => {
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const token = useAuthToken();
  const [socket, setSocket] = useState<ClientSocket>(); // Updated type
  const [roomStart, setRoomStart] = useState(false);

  const [messages, setMessages] = useState<MESSAGE_RECEIVE_PAYLOAD[]>([]);
  useEffect(() => {
    const connectSocket = async () => {
      if (token) {
        const newSocket: ClientSocket = io("https://api.luqueee.dev/chat", {
          auth: {
            token, // <--- AQUÍ SE ENVÍA
          },
          query: {
            chatId,
          },
          transports: ["websocket"],
        });
        setSocket(newSocket);
        return newSocket; // Return the socket instance
      }
    };

    if (isAuthenticated) {
      connectSocket();
    }
  }, [isAuthenticated, token, chatId]); // Added token and chatId to dependencies

  useEffect(() => {
    if (!socket) return;
    // socket.onAny((event, ...args) => {
    //   console.log(`🚗 (SOCKET ON ANY) event: ${event}`, args);
    // })
    socket.on(WEBSOCKET_EVENTS.ROOM_FULL, () => {
      console.log("🛴 Room is full, chat is starting");
      setRoomStart(true);
    });

    socket.on(WEBSOCKET_EVENTS.ROOM_LEAVE, () => {
      console.log("🛴 Room has been left");
      router.replace("/(tabs)/(chat)/");
    });

    socket.on(WEBSOCKET_EVENTS.ROOM_JOIN, (payload: ROOM_FULL_PAYLOAD) => {
      console.log("🛴 Joined room:", payload.chatId);
    });

    socket.on(
      WEBSOCKET_EVENTS.MESSAGE_RECEIVE,
      (payload: MESSAGE_RECEIVE_PAYLOAD) => {
        console.log("🛴 New message received:", payload);

        setMessages((prevMessages) => [...prevMessages, payload]);
      }
    );

    return () => {
      if (socket) {
        console.log("Disconnecting socket on unmount");
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <ChatContext.Provider value={{ socket, roomStart, messages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = use(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
