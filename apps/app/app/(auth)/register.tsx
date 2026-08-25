import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { registerUserSchema, type RegisterUserInput } from "@metanol/shared";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { TextField } from "../../src/components/TextField";
import { Button } from "../../src/components/Button";
import { ErrorView } from "../../src/components/ErrorView";
import { useAuth } from "../../src/core/auth/AuthProvider";

export default function Register() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: { name: "", nickname: "", email: "", password: "" },
  });

  const onSubmit = async (data: RegisterUserInput) => {
    setSubmitError(null);
    try {
      await registerUser({ ...data, nickname: data.nickname || undefined });
      router.replace({ pathname: "/(auth)/login", params: { registered: "1" } });
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Criar conta</Text>
      <Text className="mt-2 text-charcoal/60 dark:text-cream/60">
        Cadastre-se para participar dos rachas.
      </Text>

      <View className="mt-6 gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              label="Nome"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Seu nome completo"
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="nickname"
          render={({ field }) => (
            <TextField
              label="Apelido (opcional)"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Como te chamam no racha"
              error={errors.nickname?.message}
            />
          )}
        />
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
              placeholder="Mínimo de 8 caracteres"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password?.message}
            />
          )}
        />

        <ErrorView error={submitError} />

        <Button
          label={isSubmitting ? "Criando conta..." : "Criar conta"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>

      <Link href="/(auth)/login" asChild>
        <Pressable className="mt-6">
          <Text className="text-center text-gold">Já tenho conta</Text>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}
