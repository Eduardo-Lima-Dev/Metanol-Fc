import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";

export default function Register() {
  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Criar conta</Text>
      <Text className="mt-2 text-charcoal/60 dark:text-cream/60">
        Tela de cadastro — implementada na Fase 1.
      </Text>
      <Link href="/(auth)/login" asChild>
        <Pressable className="mt-6">
          <Text className="text-gold">Já tenho conta</Text>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}
