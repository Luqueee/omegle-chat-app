import { Id } from "@packages/backend/dataModel";

export const WEBSOCKET_EVENTS = {
  ROOM_FULL: "room:full",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVE: "message:receive",
};

export interface ROOM_FULL_PAYLOAD {
  chatId: Id<"channels">;
}

export interface MESSAGE_SEND_PAYLOAD {
  content: string;
}

export interface MESSAGE_RECEIVE_PAYLOAD {
  authorId: Id<"users">;
  content: string;
}
