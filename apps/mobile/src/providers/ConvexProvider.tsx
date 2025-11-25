import { Platform } from "react-native";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import * as SecureStore from "expo-secure-store";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

console.log("CONVEX ADDRESS STORE:", (convex as any).address);

export const ConvexProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ConvexAuthProvider
      client={convex}
      storageNamespace="auth"
      storage={
        Platform.OS === "android" || Platform.OS === "ios"
          ? secureStorage
          : undefined
      }
    >
      {children}
    </ConvexAuthProvider>
  );
};
