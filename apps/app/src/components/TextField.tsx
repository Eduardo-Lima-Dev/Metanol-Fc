import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TextFieldProps = {
  label: string;
  error?: string;
} & Pick<
  TextInputProps,
  "value" | "onChangeText" | "placeholder" | "secureTextEntry" | "keyboardType" | "autoCapitalize"
>;

export function TextField({ label, error, secureTextEntry, ...inputProps }: TextFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">{label}</Text>
      <View className="justify-center">
        <TextInput
          {...inputProps}
          secureTextEntry={isPassword && !isVisible}
          placeholderTextColor="#8A8A8A"
          className={`rounded-2xl border bg-charcoal/[0.03] px-4 py-3.5 text-base text-charcoal dark:bg-cream/[0.05] dark:text-cream ${
            isPassword ? "pr-12" : ""
          } ${error ? "border-red-500" : "border-charcoal/15 dark:border-cream/15"}`}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setIsVisible((v) => !v)}
            hitSlop={8}
            className="absolute right-3 h-8 w-8 items-center justify-center"
          >
            <Ionicons
              name={isVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#8A8A8A"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
