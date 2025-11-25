import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { Providers } from "../providers/Providers";
import { PortalHost } from "@rn-primitives/portal";
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
      </Providers>
    </SafeAreaProvider>
  );
}
