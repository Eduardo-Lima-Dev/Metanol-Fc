import { Text, TextInput, View, type TextInputProps } from "react-native";

type TextFieldProps = {
  label: string;
  error?: string;
} & Pick<
  TextInputProps,
  "value" | "onChangeText" | "placeholder" | "secureTextEntry" | "keyboardType" | "autoCapitalize"
>;

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor="#8A8A8A"
        className={`rounded-xl border px-4 py-3 text-base text-charcoal dark:text-cream ${
          error ? "border-red-500" : "border-charcoal/15 dark:border-cream/15"
        }`}
      />
      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}
