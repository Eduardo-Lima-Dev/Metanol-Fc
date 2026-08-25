import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { createRachaSchema, type CreateRachaInput } from "@metanol/shared";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { TextField } from "../../../src/components/TextField";
import { Button } from "../../../src/components/Button";
import { ErrorView } from "../../../src/components/ErrorView";
import { useCreateRacha } from "../../../src/features/rachas/hooks";

export default function CreateRacha() {
  const router = useRouter();
  const createRacha = useCreateRacha();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRachaInput>({
    resolver: zodResolver(createRachaSchema),
    defaultValues: { name: "", schedule: "" },
  });

  const onSubmit = async (data: CreateRachaInput) => {
    setSubmitError(null);
    try {
      const racha = await createRacha.mutateAsync({
        ...data,
        schedule: data.schedule || undefined,
      });
      router.replace(`/(tabs)/rachas/${racha.id}`);
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer
      title="Novo racha"
      subtitle="Você vira administrador automaticamente ao criar."
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              label="Nome"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Ex.: Pelada de Sábado"
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="schedule"
          render={({ field }) => (
            <TextField
              label="Dia e horário (opcional)"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              placeholder="Ex.: Sábados, 10h"
              error={errors.schedule?.message}
            />
          )}
        />

        <ErrorView error={submitError} />

        <Button
          label={isSubmitting ? "Criando..." : "Criar racha"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
        <Button label="Cancelar" onPress={() => router.back()} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
