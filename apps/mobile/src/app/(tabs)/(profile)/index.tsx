import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/generated";
import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useRef } from "react";
import { TriggerRef } from "@rn-primitives/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@packages/backend/models";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

export default function Profile() {
  const currentUser = useQuery(api.auth.getSessionUser);
  const { signOut } = useAuthActions();
  const popoverTriggerRef = useRef<TriggerRef>(null);

  async function onSignOut() {
    await signOut();
    popoverTriggerRef.current?.close();
    // TODO: Sign out and navigate to sign in screen
  }

  if (!currentUser) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 " edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1 px-4 "
        showsVerticalScrollIndicator={false}
        contentContainerClassName="py-6 flex flex-col gap-4"
      >
        <UserAvatar user={currentUser} />
        <Text className="font-medium leading-5">{currentUser.name}</Text>

        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onPress={onSignOut}
        >
          <Icon as={LogOutIcon} className="size-4" />
          <Text>Sign Out</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function UserAvatar({
  className,
  user,
  ...props
}: Omit<React.ComponentProps<typeof Avatar>, "alt"> & { user: User }) {
  return (
    <Avatar
      alt={`${user.name}'s avatar`}
      className={cn("size-8", className)}
      {...props}
    >
      <AvatarImage
        source={{
          uri: user.image,
        }}
      />
      <AvatarFallback>
        <Text>{user.name}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
