import { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { updateUserProfileSchema, type UpdateUserProfileInput } from "@metanol/shared";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { TextField } from "../../../src/components/TextField";
import { Button } from "../../../src/components/Button";
import { ErrorView } from "../../../src/components/ErrorView";
import { useAuth } from "../../../src/core/auth/AuthProvider";
import { httpClient } from "../../../src/core/api/httpClient";
import { endpoints } from "../../../src/core/api/endpoints";

export default function EditProfile() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const onSubmit = async () => {
    setSubmitError(null);
    setFieldErrors({});

    const payload: UpdateUserProfileInput = {};
    if (name.trim() && name.trim() !== user.name) payload.name = name.trim();
    if (nickname.trim() !== (user.nickname ?? "")) payload.nickname = nickname.trim() || undefined;
    if (password) payload.password = password;

    const result = updateUserProfileSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await httpClient.patch(endpoints.users.me, result.data);
      await refreshUser();
      router.back();
    } catch (error) {
      setSubmitError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Editar perfil</Text>

      <View className="mt-6 gap-4">
        <TextField label="Nome" value={name} onChangeText={setName} error={fieldErrors.name} />
        <TextField
          label="Apelido"
          value={nickname}
          onChangeText={setNickname}
          error={fieldErrors.nickname}
        />
        <TextField
          label="Nova senha (deixe em branco para manter a atual)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          error={fieldErrors.password}
        />

        <ErrorView error={submitError} />

        <Button
          label={isSubmitting ? "Salvando..." : "Salvar"}
          onPress={onSubmit}
          disabled={isSubmitting}
        />
        <Button label="Cancelar" onPress={() => router.back()} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
