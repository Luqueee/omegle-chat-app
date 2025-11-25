import { ThemeProvider } from "@react-navigation/native";
import { ConvexProvider } from "./ConvexProvider";
import { NAV_THEME } from "../lib/theme";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider value={NAV_THEME["dark"]}>
      <ConvexProvider>{children}</ConvexProvider>
    </ThemeProvider>
  );
};
