import type { ReactNode } from "react";
import { Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  disabled?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, { container: string; label: string }> = {
  primary: {
    container: "bg-gold active:opacity-80",
    label: "text-ink",
  },
  secondary: {
    container: "border border-gold active:bg-gold/10",
    label: "text-charcoal dark:text-cream",
  },
};

export function Button({ label, onPress, variant = "primary", icon, disabled }: ButtonProps) {
  const classes = VARIANT_CLASSES[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5 ${classes.container} ${disabled ? "opacity-40" : ""}`}
    >
      {icon}
      <Text className={`text-base font-semibold ${classes.label}`}>{label}</Text>
    </Pressable>
  );
}
