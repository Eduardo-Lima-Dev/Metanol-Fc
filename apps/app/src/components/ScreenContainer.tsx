import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ScreenContainer({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-ink" edges={["top", "left", "right"]}>
      <View className="flex-1 px-5">{children}</View>
    </SafeAreaView>
  );
}
