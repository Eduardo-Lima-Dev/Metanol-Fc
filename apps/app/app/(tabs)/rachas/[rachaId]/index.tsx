import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
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
        <ErrorView error={error} />
      </ScreenContainer>
    );
  }

  const isAdmin = role === "admin";

  return (
    <ScreenContainer title={racha.name} subtitle={racha.schedule}>
      <View className="gap-3">
        <Button
          label="Jogadores"
          onPress={() => router.push(`/(tabs)/rachas/${rachaId}/players`)}
        />
        <Button
          label="Gerar divisão de times"
          onPress={() => router.push(`/(tabs)/rachas/${rachaId}/team-splits/generate`)}
          variant="secondary"
        />
        {isAdmin ? (
          <Button
            label="Acompanhar rachas"
            onPress={() => router.push(`/(tabs)/rachas/${rachaId}/team-splits/track`)}
            variant="secondary"
          />
        ) : null}
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
