import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import type { TeamSplit } from "@metanol/shared";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Card } from "../../../../../src/components/Card";
import { Button } from "../../../../../src/components/Button";
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

function HistoryRow({ item, onPress }: { item: TeamSplit; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <Text className="font-semibold text-charcoal dark:text-cream">
          {formatDate(item.createdAt)}
        </Text>
        <Text className="mt-1 text-sm text-charcoal/60 dark:text-cream/60">
          Gerado por {item.createdByName} · {item.teams.length} times
        </Text>
        <Text className="mt-1 text-sm text-gold">
          {item.outcome === null
            ? "Resultado não registrado"
            : item.outcome === "draw"
              ? "Empate"
              : `Time ${(item.winningTeamIndex ?? 0) + 1} venceu`}
        </Text>
      </Card>
    </Pressable>
  );
}

export default function TeamSplitHistory() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useTeamSplits(rachaId, page);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Histórico</Text>

      {isLoading ? <LoadingSpinner /> : null}
      {error ? (
        <View className="mt-4">
          <ErrorView error={error} />
        </View>
      ) : null}
      {!isLoading && data?.items.length === 0 ? (
        <EmptyState title="Nenhuma divisão gerada ainda" />
      ) : null}

      {data ? (
        <FlatList
          className="mt-4"
          data={data.items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item }) => (
            <HistoryRow
              item={item}
              onPress={() => router.push(`/(tabs)/rachas/${rachaId}/team-splits/${item.id}`)}
            />
          )}
        />
      ) : null}

      {data && totalPages > 1 ? (
        <View className="flex-row items-center justify-between gap-3 pb-4">
          <View className="flex-1">
            <Button
              label="Anterior"
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              variant="secondary"
              disabled={page <= 1}
            />
          </View>
          <Text className="text-charcoal/60 dark:text-cream/60">
            {page} / {totalPages}
          </Text>
          <View className="flex-1">
            <Button
              label="Próxima"
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              variant="secondary"
              disabled={page >= totalPages}
            />
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
