import { useChatContext } from "@/providers/chat/ChatProvider";
import { View } from "react-native";
import { Text } from "../ui/text";

export const ChatScreen: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { roomStart } = useChatContext();

  if (!roomStart) {
    return (
      <View className="flex-grow flex flex-col justify-center items-center w-full">
        <Text>Waiting to start...</Text>
      </View>
    );
  }

  return <View className="flex-1">{children}</View>;
};
