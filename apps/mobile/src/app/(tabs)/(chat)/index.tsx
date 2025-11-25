import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Link, useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/generated";
import { Button } from "@/components/ui/button";
export default function Chat() {
  const router = useRouter();

  const searchChat = useMutation(api.channels.search);

  const handlerSearchChat = async () => {
    const res = await searchChat();
    if (!res || res.hasErrors) {
      console.error("error searching chat:", res?.errors);
    }
    const { chatId } = res.data!;

    console.log("searched chat:", chatId);
    router.push({ pathname: "/(tabs)/(chat)/[chatId]", params: { chatId } });
  };

  return (
    <SafeAreaView className="flex-1 " edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1 px-4 "
        showsVerticalScrollIndicator={false}
        contentContainerClassName="py-6 flex flex-col gap-4"
      >
        <Text>Chat page</Text>
        <Link
          href={{ pathname: "/(tabs)/(chat)/[chatId]", params: { chatId: 1 } }}
        >
          <Text className="text-blue-500">Go to Chat Session 1</Text>
        </Link>
        <Button onPress={handlerSearchChat}>
          <Text>create chat</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
