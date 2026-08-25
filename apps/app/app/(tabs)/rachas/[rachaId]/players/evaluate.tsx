import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";
import type { Player } from "@metanol/shared";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Card } from "../../../../../src/components/Card";
import { Button } from "../../../../../src/components/Button";
import { ScorePicker } from "../../../../../src/components/ScorePicker";
import { ErrorView, errorMessage } from "../../../../../src/components/ErrorView";
import { EmptyState } from "../../../../../src/components/EmptyState";
import { LoadingSpinner } from "../../../../../src/components/LoadingSpinner";
import { usePlayers } from "../../../../../src/features/players/hooks";
import { useCreateEvaluation } from "../../../../../src/features/evaluations/hooks";
import { useAuth } from "../../../../../src/core/auth/AuthProvider";

function EvaluationRow({ player, rachaId }: { player: Player; rachaId: string }) {
  const createEvaluation = useCreateEvaluation(rachaId);
  const [score, setScore] = useState<number | null | undefined>(undefined);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<unknown>(null);

  if (done) {
    return (
      <Card>
        <Text className="text-charcoal dark:text-cream">{player.name}</Text>
        <Text className="mt-1 text-sm text-gold">Avaliação enviada.</Text>
      </Card>
    );
  }

  const onSubmit = async () => {
    setError(null);
    try {
      await createEvaluation.mutateAsync({ evaluatedPlayerId: player.id, score: score ?? null });
      setDone(true);
    } catch (err) {
      // 409 = já avaliado antes (lista local desatualizada) — trata como concluído
      if (errorMessage(err).toLowerCase().includes("já avaliou")) {
        setDone(true);
        return;
      }
      setError(err);
    }
  };

  return (
    <Card>
      <Text className="font-semibold text-charcoal dark:text-cream">{player.name}</Text>
      <View className="mt-3">
        <ScorePicker value={score} onChange={setScore} />
      </View>
      <ErrorView error={error} />
      <View className="mt-3">
        <Button
          label={createEvaluation.isPending ? "Enviando..." : "Enviar avaliação"}
          onPress={onSubmit}
          disabled={score === undefined || createEvaluation.isPending}
          variant="secondary"
        />
      </View>
    </Card>
  );
}

export default function Evaluate() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const { user } = useAuth();
  const { data: players, isLoading, error } = usePlayers(rachaId);

  if (isLoading) return <LoadingSpinner />;

  const evaluable = players?.filter((p) => p.userId !== user?.id) ?? [];

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">
        Avaliar jogadores
      </Text>

      {error ? (
        <View className="mt-4">
          <ErrorView error={error} />
        </View>
      ) : null}

      {!isLoading && evaluable.length === 0 ? (
        <EmptyState title="Nenhum jogador para avaliar" />
      ) : null}

      <FlatList
        className="mt-4"
        data={evaluable}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 pb-6"
        renderItem={({ item }) => <EvaluationRow player={item} rachaId={rachaId} />}
      />
    </ScreenContainer>
  );
}
