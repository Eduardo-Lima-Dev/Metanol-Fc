import { Text, View } from "react-native";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { Button } from "../../../src/components/Button";
import { useTheme } from "../../../src/core/theme/ThemeProvider";

export default function Profile() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Perfil</Text>
      <Text className="mt-2 text-charcoal/60 dark:text-cream/60">
        Edição de perfil implementada na Fase 1.
      </Text>
      <View className="mt-8">
        <Button
          label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          onPress={toggleTheme}
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}
