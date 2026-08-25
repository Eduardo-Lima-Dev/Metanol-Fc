import type { ReactNode } from "react";
import { View } from "react-native";

export function Card({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-2xl bg-charcoal/5 p-4 dark:bg-cream/5">{children}</View>
  );
}
