import { Id } from "@packages/backend/dataModel";
export declare const WEBSOCKET_EVENTS: {
    ROOM_FULL: string;
    ROOM_JOIN: string;
};
export interface ROOM_FULL_Payload {
    chatId: Id<"channels">;
}
