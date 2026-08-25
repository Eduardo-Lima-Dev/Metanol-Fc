import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#D8A73C",
        tabBarInactiveTintColor: isDark ? "#F4EDE099" : "#1A1A1A99",
        tabBarStyle: {
          backgroundColor: isDark ? "#0C0C0C" : "#F4EDE0",
          borderTopColor: isDark ? "#F4EDE01A" : "#1A1A1A1A",
        },
      }}
    >
      <Tabs.Screen
        name="rachas"
        options={{
          title: "Rachas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
