import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useChatContext } from "@/providers/chat/ChatProvider";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/generated";
import { useEffect, useRef } from "react";
import { InputArea } from "./InputArea";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

export const ChatArea: React.FC = () => {
  const currentUser = useQuery(api.auth.getSessionUser);
  const { messages } = useChatContext();
  const flatListRef = useRef<FlatList>(null);

  // ⛔ NO returns antes de los hooks
  // ⛔ NO condiciones que cambien qué hooks se ejecutan

  // Auto scroll cuando llegan mensajes
  useEffect(() => {
    if (messages && messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (!currentUser) {
    // ✔ return seguro dentro del render
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 border border-white">
        <GestureHandlerRootView>
          <FlatList
            ref={flatListRef}
            data={messages ?? []}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 10, gap: 10 }}
            onContentSizeChange={() => {
              console.log("Content size changed, scrolling to end");
              flatListRef.current?.scrollToEnd();
            }}
            renderItem={({ item }) => {
              const isCurrentUser = item.authorId === currentUser._id;
              return (
                <View
                  className={`bg-zinc-900 px-2 py-1 h-12 rounded-md ${
                    isCurrentUser ? "self-end" : "self-start"
                  }`}
                >
                  <Text className="text-xl antialiased">{item.content}</Text>
                </View>
              );
            }}
          />
        </GestureHandlerRootView>
      </View>
      <InputArea refList={flatListRef} />
    </View>
  );
};
