import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";

type InfoTooltipProps = {
  title: string;
  description: string;
};

export function InfoTooltip({ title, description }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        hitSlop={8}
        accessibilityLabel={`Mais informações sobre ${title}`}
        accessibilityRole="button"
      >
        <Ionicons name="information-circle-outline" size={18} color="#D8A73C" />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-charcoal/60 px-6"
          onPress={() => setVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-charcoal/10 bg-cream p-5 dark:border-cream/10 dark:bg-ink"
          >
            <Text className="text-base font-semibold text-charcoal dark:text-cream">{title}</Text>
            <Text className="mt-2 text-sm leading-5 text-charcoal/70 dark:text-cream/70">
              {description}
            </Text>
            <View className="mt-4">
              <Button label="Entendi" onPress={() => setVisible(false)} variant="secondary" />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
