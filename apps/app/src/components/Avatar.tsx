import { Text, View } from "react-native";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 64 }: { name: string; size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-full bg-gold"
      style={{ width: size, height: size }}
    >
      <Text className="font-bold text-ink" style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
