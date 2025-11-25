import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/generated";
import { Id } from "@packages/backend/dataModel";
import { useEffect, useMemo } from "react";
import { ChatProvider } from "@/providers/chat/ChatProvider";
import { InputArea } from "@/components/chat/InputArea";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatScreen } from "@/components/chat/ChatScreen";

export default function ChatSession() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const channelId = useMemo(
    () => (chatId ? (chatId as Id<"channels">) : null),
    [chatId]
  );

  const validateChat = useQuery(
    api.channels.validateChannel,
    channelId ? { channelId } : "skip"
  );

  useEffect(() => {
    console.log("Validating chat session:", chatId, validateChat);
  }, [chatId, validateChat]);

  return (
    <ChatProvider chatId={chatId}>
      <SafeAreaView className="flex-1 p-2">
        <ChatScreen>
          <View className="flex-1 flex-col gap-4 w-full">
            {/* Header fijo */}
            <View className="pb-1">
              <Text className="text-lg font-semibold">chat room {chatId}</Text>
            </View>

            {/* Área del chat - ocupa todo el espacio */}
            <ChatArea />

            {/* Input fijo abajo */}
          </View>
        </ChatScreen>
      </SafeAreaView>
    </ChatProvider>
  );
}
