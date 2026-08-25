import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { loginSchema, type LoginInput } from "@metanol/shared";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { ErrorView } from "../../src/components/ErrorView";
import { Logo } from "../../src/components/Logo";
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow items-center justify-center py-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-sm items-center">
            <Logo size={128} />

            <Text className="mt-6 text-3xl font-bold tracking-tight text-charcoal dark:text-cream">
              Bem-vindo de volta
            </Text>
            <Text className="mt-1 text-center text-charcoal/60 dark:text-cream/60">
              Entre para acessar seus rachas.
            </Text>

            {registered ? (
              <View className="mt-5 w-full rounded-xl bg-gold/10 px-4 py-3">
                <Text className="text-center text-sm text-gold">
                  Cadastro realizado! Faça login para continuar.
                </Text>
              </View>
            ) : null}

            <View className="mt-8 w-full gap-4">
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
                <Text className="text-center text-gold">
                  Não tem conta? <Text className="font-semibold">Criar conta</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
