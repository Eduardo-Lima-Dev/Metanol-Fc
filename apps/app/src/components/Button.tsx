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
    container: "border border-charcoal/15 bg-charcoal/[0.03] active:bg-gold/10 dark:border-cream/15 dark:bg-cream/[0.04]",
    label: "text-charcoal dark:text-cream",
  },
};

const PRIMARY_SHADOW = {
  shadowColor: "#0C0C0C",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 3,
};

export function Button({ label, onPress, variant = "primary", icon, disabled }: ButtonProps) {
  const classes = VARIANT_CLASSES[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={variant === "primary" && !disabled ? PRIMARY_SHADOW : undefined}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5 ${classes.container} ${disabled ? "opacity-40" : ""}`}
    >
      {icon}
      <Text className={`text-base font-semibold ${classes.label}`}>{label}</Text>
    </Pressable>
  );
}
