import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { z } from "zod";
import { type CreateRachaInput } from "@metanol/shared";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { TextField } from "../../../src/components/TextField";
import { Button } from "../../../src/components/Button";
import { ErrorView } from "../../../src/components/ErrorView";
import { useCreateRacha } from "../../../src/features/rachas/hooks";

// Schema só do formulário: "schedule" precisa aceitar string vazia aqui (é
// isso que o campo tem enquanto o usuário não digita nada), diferente do
// createRachaSchema da API, que exige undefined nesse caso (min(1) rejeitaria
// ""). A conversão pra undefined acontece em onSubmit, antes de enviar.
const createRachaFormSchema = z.object({
  name: z.string().min(1, "Informe o nome do racha"),
  schedule: z.string().optional(),
});
type CreateRachaFormValues = z.infer<typeof createRachaFormSchema>;

export default function CreateRacha() {
  const router = useRouter();
  const createRacha = useCreateRacha();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRachaFormValues>({
    resolver: zodResolver(createRachaFormSchema),
    defaultValues: { name: "", schedule: "" },
  });

  const onSubmit = async (data: CreateRachaFormValues) => {
    setSubmitError(null);
    try {
      const input: CreateRachaInput = {
        name: data.name,
        schedule: data.schedule?.trim() || undefined,
      };
      const racha = await createRacha.mutateAsync(input);
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
