import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { ScreenContainer } from "../../../../src/components/ScreenContainer";
import { LoadingSpinner } from "../../../../src/components/LoadingSpinner";
import { ErrorView } from "../../../../src/components/ErrorView";
import { Button } from "../../../../src/components/Button";
import { useRacha, useRachaRole } from "../../../../src/features/rachas/hooks";

export default function RachaHub() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const { data: racha, isLoading, error } = useRacha(rachaId);
  const role = useRachaRole(rachaId);

  if (isLoading) return <LoadingSpinner />;

  if (error || !racha) {
    return (
      <ScreenContainer>
        <View className="mt-16">
          <ErrorView error={error} />
        </View>
      </ScreenContainer>
    );
  }

  const isAdmin = role === "admin";

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">{racha.name}</Text>
      {racha.schedule ? (
        <Text className="mt-1 text-charcoal/60 dark:text-cream/60">{racha.schedule}</Text>
      ) : null}

      <View className="mt-8 gap-3">
        <Button
          label="Jogadores"
          onPress={() => router.push(`/(tabs)/rachas/${rachaId}/players`)}
        />
        <Button
          label="Gerar divisão de times"
          onPress={() => router.push(`/(tabs)/rachas/${rachaId}/team-splits/generate`)}
          variant="secondary"
        />
        <Button
          label="Histórico de divisões"
          onPress={() => router.push(`/(tabs)/rachas/${rachaId}/team-splits/history`)}
          variant="secondary"
        />
        <Button
          label="Ranking de vitórias"
          onPress={() => router.push(`/(tabs)/rachas/${rachaId}/team-splits/ranking`)}
          variant="secondary"
        />
        <Button
          label="Membros"
          onPress={() => router.push(`/(tabs)/rachas/${rachaId}/members`)}
          variant="secondary"
        />
        {isAdmin ? (
          <Button
            label="Configurações"
            onPress={() => router.push(`/(tabs)/rachas/${rachaId}/settings`)}
            variant="secondary"
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}
