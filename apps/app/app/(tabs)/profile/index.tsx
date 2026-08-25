import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { Button } from "../../../src/components/Button";
import { Avatar } from "../../../src/components/Avatar";
import { useTheme } from "../../../src/core/theme/ThemeProvider";
import { useAuth } from "../../../src/core/auth/AuthProvider";

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (!user) return null;

  return (
    <ScreenContainer title="Perfil">
      <View className="items-center gap-3 py-4">
        <Avatar name={user.nickname ?? user.name} size={88} />
        <View className="items-center">
          <Text className="text-2xl font-bold text-charcoal dark:text-cream">
            {user.nickname ?? user.name}
          </Text>
          <Text className="text-charcoal/60 dark:text-cream/60">{user.email}</Text>
        </View>
      </View>

      <View className="mt-6 gap-3">
        <Button label="Editar perfil" onPress={() => router.push("/(tabs)/profile/edit")} />
        <Button
          label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          onPress={toggleTheme}
          variant="secondary"
        />
        <Button label="Sair" onPress={handleLogout} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
