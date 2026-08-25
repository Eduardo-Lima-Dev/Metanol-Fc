import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import type { Player } from "@metanol/shared";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Card } from "../../../../../src/components/Card";
import { Button } from "../../../../../src/components/Button";
import { EmptyState } from "../../../../../src/components/EmptyState";
import { LoadingSpinner } from "../../../../../src/components/LoadingSpinner";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { usePlayers } from "../../../../../src/features/players/hooks";
import { useRacha, useRachaRole } from "../../../../../src/features/rachas/hooks";

function PlayerRow({
  player,
  isAdmin,
  onEditStats,
}: {
  player: Player;
  isAdmin: boolean;
  onEditStats: () => void;
}) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-semibold text-charcoal dark:text-cream">
            {player.name}
            {player.userId === null ? " (avulso)" : ""}
          </Text>
          <Text className="text-sm text-charcoal/60 dark:text-cream/60">
            Média: {player.average ?? "—"} · Gols: {player.goals} · Assistências: {player.assists}
          </Text>
        </View>
        {isAdmin ? (
          <Pressable onPress={onEditStats} className="rounded-xl bg-charcoal/10 px-3 py-2 dark:bg-cream/10">
            <Text className="text-xs font-semibold text-charcoal dark:text-cream">Editar</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

export default function PlayersList() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const role = useRachaRole(rachaId);
  const isAdmin = role === "admin";

  const { data: racha } = useRacha(rachaId);
  const { data: players, isLoading, error } = usePlayers(rachaId);

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Jogadores</Text>

      <View className="mt-4 gap-2">
        {racha?.evaluationsOpen ? (
          <Button
            label="Avaliar jogadores"
            onPress={() => router.push(`/(tabs)/rachas/${rachaId}/players/evaluate`)}
          />
        ) : null}
        {isAdmin ? (
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                label="Adicionar avulso"
                onPress={() => router.push(`/(tabs)/rachas/${rachaId}/players/add-guest`)}
                variant="secondary"
              />
            </View>
            <View className="flex-1">
              <Button
                label="Importar médias"
                onPress={() => router.push(`/(tabs)/rachas/${rachaId}/players/import-averages`)}
                variant="secondary"
              />
            </View>
          </View>
        ) : null}
      </View>

      {isLoading ? <LoadingSpinner /> : null}
      {error ? (
        <View className="mt-4">
          <ErrorView error={error} />
        </View>
      ) : null}
      {!isLoading && players?.length === 0 ? (
        <EmptyState title="Nenhum jogador ainda" />
      ) : null}

      {players ? (
        <FlatList
          className="mt-4"
          data={players}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item }) => (
            <PlayerRow
              player={item}
              isAdmin={isAdmin}
              onEditStats={() =>
                router.push(`/(tabs)/rachas/${rachaId}/players/${item.id}/edit-stats`)
              }
            />
          )}
        />
      ) : null}
    </ScreenContainer>
  );
}
