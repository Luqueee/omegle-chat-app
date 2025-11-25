import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserProfile";
export default function Home() {
  return (
    <SafeAreaView className="flex-1 " edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="py-6"
      >
        {/* Hero Section */}
        <Text>aaa</Text>
        <Button>
          <Text>aaa</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
