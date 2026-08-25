import type { ReactNode } from "react";
import { View } from "react-native";

const CARD_SHADOW = {
  shadowColor: "#0C0C0C",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
};

export function Card({ children }: { children: ReactNode }) {
  return (
    <View
      style={CARD_SHADOW}
      className="rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] p-4 dark:border-cream/10 dark:bg-cream/[0.05]"
    >
      {children}
    </View>
  );
}
