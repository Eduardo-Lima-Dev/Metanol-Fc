import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { ScreenContainer } from "../../../../../../src/components/ScreenContainer";
import { TextField } from "../../../../../../src/components/TextField";
import { Button } from "../../../../../../src/components/Button";
import { ErrorView } from "../../../../../../src/components/ErrorView";
import { LoadingSpinner } from "../../../../../../src/components/LoadingSpinner";
import { usePlayers, useUpdatePlayerStats } from "../../../../../../src/features/players/hooks";

export default function EditPlayerStats() {
  const { rachaId, playerId } = useLocalSearchParams<{ rachaId: string; playerId: string }>();
  const router = useRouter();
  const { data: players, isLoading } = usePlayers(rachaId);
  const updateStats = useUpdatePlayerStats(rachaId);

  const player = players?.find((p) => p.id === playerId);
  const [goals, setGoals] = useState("");
  const [assists, setAssists] = useState("");
  const [submitError, setSubmitError] = useState<unknown>(null);

  useEffect(() => {
    if (player) {
      setGoals(String(player.goals));
      setAssists(String(player.assists));
    }
  }, [player]);

  if (isLoading || !player) return <LoadingSpinner />;

  const onSave = async () => {
    setSubmitError(null);
    const parsedGoals = Number(goals);
    const parsedAssists = Number(assists);
    if (!Number.isInteger(parsedGoals) || parsedGoals < 0 || !Number.isInteger(parsedAssists) || parsedAssists < 0) {
      setSubmitError(new Error("Gols e assistências devem ser números inteiros não negativos."));
      return;
    }

    try {
      await updateStats.mutateAsync({
        playerId,
        input: { goals: parsedGoals, assists: parsedAssists },
      });
      router.back();
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">
        {player.name}
      </Text>

      <View className="mt-6 gap-4">
        <TextField
          label="Gols"
          value={goals}
          onChangeText={setGoals}
          keyboardType="number-pad"
        />
        <TextField
          label="Assistências"
          value={assists}
          onChangeText={setAssists}
          keyboardType="number-pad"
        />

        <ErrorView error={submitError} />

        <Button
          label={updateStats.isPending ? "Salvando..." : "Salvar"}
          onPress={onSave}
          disabled={updateStats.isPending}
        />
      </View>
    </ScreenContainer>
  );
}
