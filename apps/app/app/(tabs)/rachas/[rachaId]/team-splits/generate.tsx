import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  defaultGeneticAlgorithmParams,
  defaultTeamSplitWeights,
  teamSplitParamsSchema,
  type TeamSplitParams,
} from "@metanol/shared";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { TextField } from "../../../../../src/components/TextField";
import { Button } from "../../../../../src/components/Button";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { EmptyState } from "../../../../../src/components/EmptyState";
import { LoadingSpinner } from "../../../../../src/components/LoadingSpinner";
import { usePlayers } from "../../../../../src/features/players/hooks";
import { useRacha, useRachaRole } from "../../../../../src/features/rachas/hooks";
import { useGenerateTeamSplit } from "../../../../../src/features/team-splits/hooks";

export default function GenerateTeamSplit() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const role = useRachaRole(rachaId);
  const { data: racha } = useRacha(rachaId);
  const { data: players, isLoading } = usePlayers(rachaId);
  const generateTeamSplit = useGenerateTeamSplit(rachaId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [numberOfTeams, setNumberOfTeams] = useState("2");
  const [playersPerTeam, setPlayersPerTeam] = useState("5");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [weightAverage, setWeightAverage] = useState(String(defaultTeamSplitWeights.average));
  const [weightGoals, setWeightGoals] = useState(String(defaultTeamSplitWeights.goals));
  const [weightAssists, setWeightAssists] = useState(String(defaultTeamSplitWeights.assists));
  const [populationSize, setPopulationSize] = useState(
    String(defaultGeneticAlgorithmParams.populationSize),
  );
  const [generations, setGenerations] = useState(
    String(defaultGeneticAlgorithmParams.generations),
  );
  const [submitError, setSubmitError] = useState<unknown>(null);

  if (isLoading || !racha) return <LoadingSpinner />;

  const isAdmin = role === "admin";
  const canGenerate = isAdmin || racha.teamSplitOpenToMembers;

  if (!canGenerate) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Divisão fechada para membros"
          description="Peça para um administrador do racha abrir a divisão de times para membros, ou gere pelo próprio administrador."
        />
      </ScreenContainer>
    );
  }

  if (!players || players.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState title="Nenhum jogador cadastrado neste racha ainda" />
      </ScreenContainer>
    );
  }

  const toggle = (playerId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const onSubmit = async () => {
    setSubmitError(null);

    const params: TeamSplitParams = {
      numberOfTeams: Number(numberOfTeams),
      playersPerTeam: Number(playersPerTeam),
      weights: {
        average: Number(weightAverage),
        goals: Number(weightGoals),
        assists: Number(weightAssists),
      },
      algorithm: {
        ...defaultGeneticAlgorithmParams,
        populationSize: Number(populationSize),
        generations: Number(generations),
      },
    };

    const result = teamSplitParamsSchema.safeParse(params);
    if (!result.success) {
      setSubmitError(new Error(result.error.issues[0]?.message ?? "Parâmetros inválidos."));
      return;
    }
    if (selected.size === 0) {
      setSubmitError(new Error("Selecione ao menos um jogador presente."));
      return;
    }
    if (selected.size < params.numberOfTeams) {
      setSubmitError(new Error("O número de jogadores deve ser ao menos igual ao número de times."));
      return;
    }

    try {
      const response = await generateTeamSplit.mutateAsync({
        presentPlayerIds: Array.from(selected),
        params: result.data,
      });
      router.replace(`/(tabs)/rachas/${rachaId}/team-splits/${response.id}`);
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer title="Gerar divisão">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
          Jogadores presentes ({selected.size})
        </Text>
        <View className="mt-2 gap-2">
          {players.map((player) => {
            const isSelected = selected.has(player.id);
            return (
              <Pressable
                key={player.id}
                onPress={() => toggle(player.id)}
                className="flex-row items-center gap-3 rounded-xl bg-charcoal/5 px-4 py-3 dark:bg-cream/5"
              >
                <Ionicons
                  name={isSelected ? "checkbox" : "square-outline"}
                  size={20}
                  color={isSelected ? "#D8A73C" : "#8A8A8A"}
                />
                <Text className="text-charcoal dark:text-cream">{player.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Número de times"
              value={numberOfTeams}
              onChangeText={setNumberOfTeams}
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Jogadores por time"
              value={playersPerTeam}
              onChangeText={setPlayersPerTeam}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Pressable onPress={() => setShowAdvanced((v) => !v)} className="mt-4">
          <Text className="text-gold">
            {showAdvanced ? "Ocultar parâmetros avançados" : "Mostrar parâmetros avançados"}
          </Text>
        </Pressable>

        {showAdvanced ? (
          <View className="mt-3 gap-3">
            <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">Pesos</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label="Média"
                  value={weightAverage}
                  onChangeText={setWeightAverage}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Gols"
                  value={weightGoals}
                  onChangeText={setWeightGoals}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Assistências"
                  value={weightAssists}
                  onChangeText={setWeightAssists}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
              Algoritmo genético
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label="População"
                  value={populationSize}
                  onChangeText={setPopulationSize}
                  keyboardType="number-pad"
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Gerações"
                  value={generations}
                  onChangeText={setGenerations}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>
        ) : null}

        <View className="mt-6 mb-8">
          <ErrorView error={submitError} />
          <View className="mt-3">
            <Button
              label={generateTeamSplit.isPending ? "Gerando divisão..." : "Gerar divisão"}
              onPress={onSubmit}
              disabled={generateTeamSplit.isPending}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
