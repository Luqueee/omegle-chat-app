import { api } from "@packages/backend/generated";
import { User } from "@packages/backend/models";
import { LogOutIcon, SettingsIcon } from "lucide-react-native";

import { useQuery } from "convex/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { TriggerRef } from "@rn-primitives/popover";
import * as React from "react";
import { View } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect } from "react";

export function UserMenu() {
  const currentUser = useQuery(api.auth.getSessionUser);
  const { signOut } = useAuthActions();

  const popoverTriggerRef = React.useRef<TriggerRef>(null);

  async function onSignOut() {
    await signOut();
    popoverTriggerRef.current?.close();
    // TODO: Sign out and navigate to sign in screen
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <UserAvatar user={currentUser} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="mt-28 w-80 p-0">
        <View className="gap-3 border-b border-border p-3">
          <View className="flex-row items-center gap-3">
            <UserAvatar className="size-10" user={currentUser} />
            <View className="flex-1">
              <Text className="font-medium leading-5">{currentUser.name}</Text>
              {/* {USER.fullName?.length ? (
                <Text className="text-sm font-normal leading-4 text-muted-foreground">
                  {USER.username}
                </Text>
              ) : null} */}
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3 py-0.5">
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                // TODO: Navigate to account settings screen
              }}
            >
              <Icon as={SettingsIcon} className="size-4" />
              <Text>Manage Account</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onPress={onSignOut}
            >
              <Icon as={LogOutIcon} className="size-4" />
              <Text>Sign Out</Text>
            </Button>
          </View>
        </View>
      </PopoverContent>
    </Popover>
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
