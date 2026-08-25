import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-1 px-8">
      <Text className="text-center text-lg font-semibold text-charcoal dark:text-cream">
        {title}
      </Text>
      {description ? (
        <Text className="text-center text-sm text-charcoal/60 dark:text-cream/60">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
