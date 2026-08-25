import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import type { TeamSplit } from "@metanol/shared";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Card } from "../../../../../src/components/Card";
import { EmptyState } from "../../../../../src/components/EmptyState";
import { LoadingSpinner } from "../../../../../src/components/LoadingSpinner";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { useTeamSplits } from "../../../../../src/features/team-splits/hooks";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrackRow({ item, onPress }: { item: TeamSplit; onPress: () => void }) {
  const playersRegistered = item.playerStats.length > 0;

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold text-charcoal dark:text-cream">
              {formatDate(item.createdAt)}
            </Text>
            <Text className="mt-1 text-sm text-charcoal/60 dark:text-cream/60">
              {item.teams.length} times · Gerado por {item.createdByName}
            </Text>
          </View>
          <View className="rounded-full bg-gold/15 px-3 py-1">
            <Text className="text-xs font-semibold text-gold">
              {playersRegistered ? "Em andamento" : "Pendente"}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function TrackTeamSplits() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useTeamSplits(rachaId, 1, 50);

  const pending = data?.items.filter((item) => item.outcome === null) ?? [];

  return (
    <ScreenContainer title="Acompanhar rachas" subtitle="Divisões geradas que ainda não foram fechadas.">
      {isLoading ? <LoadingSpinner /> : null}
      {error ? <ErrorView error={error} /> : null}
      {!isLoading && pending.length === 0 ? (
        <EmptyState
          title="Nada pendente"
          description="Todas as divisões geradas já têm resultado registrado."
        />
      ) : null}

      {data ? (
        <FlatList
          className="mt-4"
          data={pending}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#D8A73C" />
          }
          renderItem={({ item }) => (
            <TrackRow
              item={item}
              onPress={() => router.push(`/(tabs)/rachas/${rachaId}/team-splits/${item.id}`)}
            />
          )}
        />
      ) : null}
    </ScreenContainer>
  );
}
