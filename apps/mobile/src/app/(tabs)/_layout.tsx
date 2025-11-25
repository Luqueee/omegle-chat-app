import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text } from "@/components/ui/text";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default function TabsLayout() {
  return (
    <>
      <Unauthenticated>
        <AuthScreen />
      </Unauthenticated>
      <Authenticated>
        <Tabs>
          <Tabs.Screen
            name="(home)"
            options={{
              title: "Home",
              headerShown: false, // Hide header for home screen
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(chat)"
            options={{
              title: "Chat",
              headerShown: false, // Hide header for home screen
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbox" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(profile)"
            options={{
              title: "Profile",
              headerShown: false, // Hide header for home screen
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </Authenticated>
    </>
  );
}
