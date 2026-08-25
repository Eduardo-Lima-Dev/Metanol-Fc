import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";
import type { TeamSplitPlayerRankingEntry } from "@metanol/shared";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Card } from "../../../../../src/components/Card";
import { EmptyState } from "../../../../../src/components/EmptyState";
import { LoadingSpinner } from "../../../../../src/components/LoadingSpinner";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { useTeamSplitRanking } from "../../../../../src/features/team-splits/hooks";

function RankingRow({ entry, position }: { entry: TeamSplitPlayerRankingEntry; position: number }) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="w-6 text-center font-bold text-gold">{position}</Text>
          <Text className="font-semibold text-charcoal dark:text-cream">{entry.name}</Text>
        </View>
        <Text className="text-charcoal/70 dark:text-cream/70">
          {entry.wins} {entry.wins === 1 ? "vitória" : "vitórias"}
        </Text>
      </View>
    </Card>
  );
}

export default function TeamSplitRanking() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const { data, isLoading, error } = useTeamSplitRanking(rachaId);

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">
        Ranking de vitórias
      </Text>

      {isLoading ? <LoadingSpinner /> : null}
      {error ? (
        <View className="mt-4">
          <ErrorView error={error} />
        </View>
      ) : null}
      {!isLoading && data?.length === 0 ? (
        <EmptyState title="Nenhum resultado registrado ainda" />
      ) : null}

      {data ? (
        <FlatList
          className="mt-4"
          data={data}
          keyExtractor={(item) => item.playerId}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item, index }) => <RankingRow entry={item} position={index + 1} />}
        />
      ) : null}
    </ScreenContainer>
  );
}
