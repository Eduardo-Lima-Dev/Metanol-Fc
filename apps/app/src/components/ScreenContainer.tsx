import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenContainerProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
};

export function ScreenContainer({ children, title, subtitle, header }: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream dark:bg-ink" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-5">
          {header ? (
            <View className="mb-6 mt-3">{header}</View>
          ) : title ? (
            <View className="mb-6 mt-3">
              <Text className="text-3xl font-bold tracking-tight text-charcoal dark:text-cream">
                {title}
              </Text>
              {subtitle ? (
                <Text className="mt-1 text-charcoal/60 dark:text-cream/60">{subtitle}</Text>
              ) : null}
            </View>
          ) : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
