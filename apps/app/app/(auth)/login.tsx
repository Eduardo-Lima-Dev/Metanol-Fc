import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";

export default function Login() {
  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Entrar</Text>
      <Text className="mt-2 text-charcoal/60 dark:text-cream/60">
        Tela de login — implementada na Fase 1.
      </Text>
      <Link href="/(auth)/register" asChild>
        <Pressable className="mt-6">
          <Text className="text-gold">Criar conta</Text>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}
