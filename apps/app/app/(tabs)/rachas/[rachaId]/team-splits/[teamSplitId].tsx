import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Card } from "../../../../../src/components/Card";
import { Button } from "../../../../../src/components/Button";
import { TextField } from "../../../../../src/components/TextField";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { LoadingSpinner } from "../../../../../src/components/LoadingSpinner";
import { usePlayers } from "../../../../../src/features/players/hooks";
import { useRachaRole } from "../../../../../src/features/rachas/hooks";
import {
  useRecordTeamSplitPlayerStats,
  useRecordTeamSplitResult,
  useTeamSplit,
} from "../../../../../src/features/team-splits/hooks";

type StatEntry = { goals: string; assists: string };

export default function TeamSplitDetail() {
  const { rachaId, teamSplitId } = useLocalSearchParams<{
    rachaId: string;
    teamSplitId: string;
  }>();
  const role = useRachaRole(rachaId);
  const { data: teamSplit, isLoading, error } = useTeamSplit(rachaId, teamSplitId);
  const { data: players } = usePlayers(rachaId);
  const recordResult = useRecordTeamSplitResult(rachaId, teamSplitId);
  const recordPlayerStats = useRecordTeamSplitPlayerStats(rachaId, teamSplitId);

  const [selectedWinner, setSelectedWinner] = useState<number | "draw" | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [statsByPlayer, setStatsByPlayer] = useState<Record<string, StatEntry> | null>(null);
  const [statsError, setStatsError] = useState<unknown>(null);

  if (isLoading) return <LoadingSpinner />;

  if (error || !teamSplit) {
    return (
      <ScreenContainer>
        <ErrorView error={error} />
      </ScreenContainer>
    );
  }

  const playerName = (playerId: string) =>
    players?.find((p) => p.id === playerId)?.name ?? "Jogador";

  const isAdmin = role === "admin";
  const hasResult = teamSplit.outcome !== null;
  const participantIds = teamSplit.teams.flatMap((team) => team.playerIds);

  if (statsByPlayer === null) {
    const initial: Record<string, StatEntry> = {};
    for (const playerId of participantIds) {
      const existing = teamSplit.playerStats.find((s) => s.playerId === playerId);
      initial[playerId] = {
        goals: String(existing?.goals ?? 0),
        assists: String(existing?.assists ?? 0),
      };
    }
    setStatsByPlayer(initial);
  }

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

  const onSaveStats = async () => {
    setStatsError(null);
    if (!statsByPlayer) return;

    const entries = [];
    for (const playerId of participantIds) {
      const entry = statsByPlayer[playerId];
      const goals = Number(entry?.goals ?? 0);
      const assists = Number(entry?.assists ?? 0);
      if (!Number.isInteger(goals) || goals < 0 || !Number.isInteger(assists) || assists < 0) {
        setStatsError(new Error("Gols e assistências devem ser números inteiros não negativos."));
        return;
      }
      entries.push({ playerId, goals, assists });
    }

    try {
      await recordPlayerStats.mutateAsync({ entries });
    } catch (error) {
      setStatsError(error);
    }
  };

  return (
    <ScreenContainer title="Divisão de times" subtitle={`Gerado por ${teamSplit.createdByName}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-3">
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

        {isAdmin ? (
          <View className="mt-6 gap-3">
            <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
              Gols e assistências deste jogo
            </Text>
            {participantIds.map((playerId) => (
              <Card key={playerId}>
                <Text className="mb-3 font-medium text-charcoal dark:text-cream">
                  {playerName(playerId)}
                </Text>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextField
                      label="Gols"
                      value={statsByPlayer?.[playerId]?.goals ?? "0"}
                      onChangeText={(value) =>
                        setStatsByPlayer((prev) => ({
                          ...prev,
                          [playerId]: { goals: value, assists: prev?.[playerId]?.assists ?? "0" },
                        }))
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <TextField
                      label="Assistências"
                      value={statsByPlayer?.[playerId]?.assists ?? "0"}
                      onChangeText={(value) =>
                        setStatsByPlayer((prev) => ({
                          ...prev,
                          [playerId]: { goals: prev?.[playerId]?.goals ?? "0", assists: value },
                        }))
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </Card>
            ))}

            <ErrorView error={statsError} />

            <Button
              label={recordPlayerStats.isPending ? "Salvando..." : "Salvar estatísticas"}
              onPress={onSaveStats}
              disabled={recordPlayerStats.isPending}
            />
          </View>
        ) : null}

        {hasResult ? (
          <View className="mt-6 rounded-xl bg-gold/10 px-4 py-3">
            <Text className="text-gold">
              {teamSplit.outcome === "draw"
                ? "Resultado: empate"
                : `Resultado: Time ${(teamSplit.winningTeamIndex ?? 0) + 1} venceu`}
            </Text>
          </View>
        ) : isAdmin ? (
          <View className="mt-6 mb-8 gap-3">
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
