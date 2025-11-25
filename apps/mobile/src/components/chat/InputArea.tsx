import { View } from "react-native";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Ionicons } from "@expo/vector-icons";
import { use, useState } from "react";
import { ChatContext } from "@/providers/chat/ChatProvider";
import { useMessageActions } from "@/hooks/chat/use-message-actions";
import { FlatList } from "react-native";

export const InputArea: React.FC<{
  refList: React.RefObject<FlatList | null>;
}> = ({ refList }) => {
  const { sendMessage } = useMessageActions();
  const [text, setText] = useState("");

  const handlerSendMessage = () => {
    if (text.trim().length === 0) return;
    sendMessage(text.trim());
    setText("");
    refList.current?.scrollToEnd({ animated: true });
  };

  const handlerTestDifuse = () => {
    for (let i = 0; i < 30; i++) {
      sendMessage(`Test message ${i + 1}`);
    }
  };

  return (
    <View className="h-fit pb-4 flex flex-row gap-4">
      <Input value={text} onChangeText={setText} className="flex-1" />
      <Button
        onPress={handlerSendMessage}
        variant={"outline"}
        className="w-fit"
      >
        <Ionicons name="send-outline" size={24} color={"white"} />
      </Button>
      <Button onPress={handlerTestDifuse} variant={"outline"} className="w-fit">
        <Ionicons name="send-outline" size={24} color={"white"} />
      </Button>
    </View>
  );
};
