import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Card } from "../../../../../src/components/Card";
import { Button } from "../../../../../src/components/Button";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { LoadingSpinner } from "../../../../../src/components/LoadingSpinner";
import { usePlayers } from "../../../../../src/features/players/hooks";
import { useRachaRole } from "../../../../../src/features/rachas/hooks";
import { useRecordTeamSplitResult, useTeamSplit } from "../../../../../src/features/team-splits/hooks";

export default function TeamSplitDetail() {
  const { rachaId, teamSplitId } = useLocalSearchParams<{
    rachaId: string;
    teamSplitId: string;
  }>();
  const role = useRachaRole(rachaId);
  const { data: teamSplit, isLoading, error } = useTeamSplit(rachaId, teamSplitId);
  const { data: players } = usePlayers(rachaId);
  const recordResult = useRecordTeamSplitResult(rachaId, teamSplitId);

  const [selectedWinner, setSelectedWinner] = useState<number | "draw" | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);

  if (isLoading) return <LoadingSpinner />;

  if (error || !teamSplit) {
    return (
      <ScreenContainer>
        <View className="mt-16">
          <ErrorView error={error} />
        </View>
      </ScreenContainer>
    );
  }

  const playerName = (playerId: string) =>
    players?.find((p) => p.id === playerId)?.name ?? "Jogador";

  const isAdmin = role === "admin";
  const hasResult = teamSplit.outcome !== null;

  const onConfirmResult = async () => {
    setSubmitError(null);
    if (selectedWinner === null) {
      setSubmitError(new Error("Selecione o resultado."));
      return;
    }
    try {
      if (selectedWinner === "draw") {
        await recordResult.mutateAsync({ outcome: "draw" });
      } else {
        await recordResult.mutateAsync({ outcome: "team_win", winningTeamIndex: selectedWinner });
      }
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">
          Divisão de times
        </Text>
        <Text className="mt-1 text-sm text-charcoal/60 dark:text-cream/60">
          Gerado por {teamSplit.createdByName}
        </Text>

        <View className="mt-6 gap-3">
          {teamSplit.teams.map((team) => {
            const isWinner = teamSplit.outcome === "team_win" && teamSplit.winningTeamIndex === team.index;
            return (
              <Card key={team.index}>
                <Text className="font-semibold text-charcoal dark:text-cream">
                  Time {team.index + 1}
                  {isWinner ? " 🏆" : ""}
                </Text>
                <View className="mt-2 gap-1">
                  {team.playerIds.map((playerId) => (
                    <Text key={playerId} className="text-charcoal/80 dark:text-cream/80">
                      {playerName(playerId)}
                    </Text>
                  ))}
                </View>
              </Card>
            );
          })}
        </View>

        {hasResult ? (
          <View className="mt-6 rounded-xl bg-gold/10 px-4 py-3">
            <Text className="text-gold">
              {teamSplit.outcome === "draw"
                ? "Resultado: empate"
                : `Resultado: Time ${(teamSplit.winningTeamIndex ?? 0) + 1} venceu`}
            </Text>
          </View>
        ) : isAdmin ? (
          <View className="mt-6 gap-3">
            <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
              Registrar resultado
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {teamSplit.teams.map((team) => (
                <Pressable
                  key={team.index}
                  onPress={() => setSelectedWinner(team.index)}
                  className={`rounded-xl px-4 py-2 ${
                    selectedWinner === team.index ? "bg-gold" : "bg-charcoal/10 dark:bg-cream/10"
                  }`}
                >
                  <Text
                    className={
                      selectedWinner === team.index
                        ? "text-ink"
                        : "text-charcoal dark:text-cream"
                    }
                  >
                    Time {team.index + 1} venceu
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setSelectedWinner("draw")}
                className={`rounded-xl px-4 py-2 ${
                  selectedWinner === "draw" ? "bg-gold" : "bg-charcoal/10 dark:bg-cream/10"
                }`}
              >
                <Text
                  className={selectedWinner === "draw" ? "text-ink" : "text-charcoal dark:text-cream"}
                >
                  Empate
                </Text>
              </Pressable>
            </View>

            <ErrorView error={submitError} />

            <Button
              label={recordResult.isPending ? "Salvando..." : "Confirmar resultado"}
              onPress={onConfirmResult}
              disabled={recordResult.isPending}
            />
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
