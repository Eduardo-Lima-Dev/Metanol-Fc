import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { TextField } from "../../../../../src/components/TextField";
import { ScorePicker } from "../../../../../src/components/ScorePicker";
import { Button } from "../../../../../src/components/Button";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { useAddGuestPlayer } from "../../../../../src/features/players/hooks";

export default function AddGuestPlayer() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const addGuestPlayer = useAddGuestPlayer(rachaId);

  const [name, setName] = useState("");
  const [manualAverage, setManualAverage] = useState<number | null | undefined>(undefined);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const onSubmit = async () => {
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError(new Error("Informe o nome do jogador avulso."));
      return;
    }

    try {
      await addGuestPlayer.mutateAsync({
        name: name.trim(),
        manualAverage: manualAverage ?? undefined,
      });
      router.back();
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer
      title="Jogador avulso"
      subtitle="Participa só desta ocasião, sem conta no sistema."
    >
      <View className="gap-4">
        <TextField label="Nome" value={name} onChangeText={setName} placeholder="Nome do jogador" />

        <View className="gap-1.5">
          <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
            Overall inicial (opcional)
          </Text>
          <ScorePicker
            value={manualAverage}
            onChange={setManualAverage}
            nullLabel="Deixar em branco"
          />
        </View>

        <ErrorView error={submitError} />

        <Button
          label={addGuestPlayer.isPending ? "Adicionando..." : "Adicionar"}
          onPress={onSubmit}
          disabled={addGuestPlayer.isPending}
        />
      </View>
    </ScreenContainer>
  );
}
