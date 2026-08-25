import { Pressable, Text, View } from "react-native";

const SCORES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

type ScorePickerProps = {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  nullLabel?: string;
};

export function ScorePicker({ value, onChange, nullLabel = "Não sei" }: ScorePickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {SCORES.map((score) => {
        const selected = value === score;
        return (
          <Pressable
            key={score}
            onPress={() => onChange(score)}
            className={`h-9 w-9 items-center justify-center rounded-full ${
              selected ? "bg-gold" : "bg-charcoal/10 dark:bg-cream/10"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selected ? "text-ink" : "text-charcoal dark:text-cream"
              }`}
            >
    {score}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => onChange(null)}
        className={`h-9 items-center justify-center rounded-full px-3 ${
          value === null ? "bg-gold" : "bg-charcoal/10 dark:bg-cream/10"
        }`}
      >
        <Text
          className={`text-xs font-semibold ${
            value === null ? "text-ink" : "text-charcoal dark:text-cream"
          }`}
        >
          {nullLabel}
        </Text>
      </Pressable>
    </View>
  );
}
