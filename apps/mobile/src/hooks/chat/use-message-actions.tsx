import { useChatContext } from "@/providers/chat/ChatProvider";
import { WEBSOCKET_EVENTS } from "@packages/websocket/events";

export const useMessageActions = () => {
  const { socket } = useChatContext();

  const sendMessage = (message: string) => {
    if (!socket) return;
    socket.emit(WEBSOCKET_EVENTS.MESSAGE_SEND, {
      content: message,
    });
  };

  return {
    sendMessage,
  };
};
