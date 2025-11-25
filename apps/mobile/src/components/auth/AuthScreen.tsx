import { Stack } from "expo-router";
import * as React from "react";
import { Button } from "../ui/button";
import { Image, Platform, View } from "react-native";
import { cn } from "@/lib/utils";
import { makeRedirectUri } from "expo-auth-session";
import { useAuthActions } from "@convex-dev/auth/react";
import { Providers } from "@packages/backend/auth";
import { openAuthSessionAsync } from "expo-web-browser";

const SCREEN_OPTIONS = {
  title: "Auth Screen",
  headerTransparent: true,
};

const SOCIAL_CONNECTION_STRATEGIES: {
  type: Providers;
  source: { uri: string };
  useTint: boolean;
}[] = [
  // {
  //   type: 'oauth_apple',
  //   source: { uri: 'https://img.clerk.com/static/apple.png?width=160' },
  //   useTint: true,
  // },
  {
    type: "google",
    source: { uri: "https://img.clerk.com/static/google.png?width=160" },
    useTint: false,
  },
];

const redirectTo = makeRedirectUri();

export function AuthScreen() {
  const { signIn } = useAuthActions();

  const handleAuth = async (provider: Providers) => {
    const { redirect } = await signIn(provider, {
      redirectTo,
    });

    if (Platform.OS === "web") {
      return;
    }

    const result = await openAuthSessionAsync(redirect!.toString(), redirectTo);

    if (result.type === "success") {
      const { url } = result;

      const code = new URL(url).searchParams.get("code")!;

      await signIn(provider, { code });
      // location.reload();
    } else {
      console.log("Authentication canceled");
    }
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 bg-zinc-800 p-4">
        <View className="gap-2 sm:flex-row sm:gap-3">
          {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
            return (
              <Button
                key={strategy.type}
                variant="outline"
                size="lg"
                className="sm:flex-1"
                onPress={() => {
                  handleAuth(strategy.type);
                }}
              >
                <Image
                  className={cn(
                    "size-4",
                    strategy.useTint && Platform.select({ web: "dark:invert" })
                  )}
                  // tintColor={Platform.select({
                  //   native: 'black',
                  // })}
                  source={strategy.source}
                />
              </Button>
            );
          })}
        </View>
      </View>
    </>
  );
}
