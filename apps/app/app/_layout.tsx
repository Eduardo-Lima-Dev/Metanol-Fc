import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "../src/core/api/queryClient";
import { ThemeProvider, useTheme } from "../src/core/theme/ThemeProvider";
import { AuthProvider, useAuth } from "../src/core/auth/AuthProvider";
import { LoadingSpinner } from "../src/components/LoadingSpinner";

function RootNavigator() {
  const { theme } = useTheme();
  const { status } = useAuth();

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {status === "loading" ? (
        <LoadingSpinner />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          {status === "authenticated" ? (
            <Stack.Screen name="(tabs)" />
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
