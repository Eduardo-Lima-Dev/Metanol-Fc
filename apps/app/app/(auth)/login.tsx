import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { loginSchema, type LoginInput } from "@metanol/shared";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { ErrorView } from "../../src/components/ErrorView";
import { useAuth } from "../../src/core/auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setSubmitError(null);
    try {
      await login(data);
      router.replace("/(tabs)/rachas");
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Entrar</Text>
      <Text className="mt-2 text-charcoal/60 dark:text-cream/60">
        Acesse sua conta do Metanol FC.
      </Text>

      {registered ? (
        <View className="mt-4 rounded-xl bg-gold/10 px-4 py-3">
          <Text className="text-sm text-gold">Cadastro realizado! Faça login para continuar.</Text>
        </View>
      ) : null}

      <View className="mt-6 gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="E-mail"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="voce@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label="Senha"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password?.message}
            />
          )}
        />

        <ErrorView error={submitError} />

        <Button
          label={isSubmitting ? "Entrando..." : "Entrar"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>

      <Link href="/(auth)/register" asChild>
        <Pressable className="mt-6">
          <Text className="text-center text-gold">Criar conta</Text>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}
