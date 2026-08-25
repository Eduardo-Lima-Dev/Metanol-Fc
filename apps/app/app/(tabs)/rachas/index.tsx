import { useRouter } from "expo-router";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RachaWithRole } from "@metanol/shared";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { EmptyState } from "../../../src/components/EmptyState";
import { LoadingSpinner } from "../../../src/components/LoadingSpinner";
import { ErrorView } from "../../../src/components/ErrorView";
import { Card } from "../../../src/components/Card";
import { useRachas } from "../../../src/features/rachas/hooks";

function RachaCard({ racha, onPress }: { racha: RachaWithRole; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-charcoal dark:text-cream">
              {racha.name}
            </Text>
            {racha.schedule ? (
              <Text className="mt-0.5 text-sm text-charcoal/60 dark:text-cream/60">
                {racha.schedule}
              </Text>
            ) : null}
          </View>
          <View className="rounded-full bg-gold/15 px-3 py-1">
            <Text className="text-xs font-semibold text-gold">
              {racha.role === "admin" ? "Admin" : "Membro"}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function RachasList() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useRachas();

  return (
    <ScreenContainer>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-charcoal dark:text-cream">Rachas</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/rachas/create")}
          className="h-11 w-11 items-center justify-center rounded-full bg-gold"
        >
          <Ionicons name="add" size={24} color="#0C0C0C" />
        </Pressable>
      </View>

      {isLoading ? <LoadingSpinner /> : null}

      {error ? (
        <View className="mt-4">
          <ErrorView error={error} />
        </View>
      ) : null}

      {!isLoading && !error && data?.length === 0 ? (
        <EmptyState
          title="Nenhum racha ainda"
          description="Crie o primeiro racha para começar a organizar suas peladas."
        />
      ) : null}

      {data && data.length > 0 ? (
        <FlatList
          className="mt-4"
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#D8A73C" />
          }
          renderItem={({ item }) => (
            <RachaCard
              racha={item}
              onPress={() => router.push(`/(tabs)/rachas/${item.id}`)}
            />
          )}
        />
      ) : null}
    </ScreenContainer>
  );
}
