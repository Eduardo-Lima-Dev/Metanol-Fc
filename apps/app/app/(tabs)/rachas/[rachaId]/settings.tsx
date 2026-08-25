import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Switch, Text, View } from "react-native";
import { ScreenContainer } from "../../../../src/components/ScreenContainer";
import { TextField } from "../../../../src/components/TextField";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { ErrorView } from "../../../../src/components/ErrorView";
import { LoadingSpinner } from "../../../../src/components/LoadingSpinner";
import {
  useRacha,
  useSetEvaluationsOpen,
  useSetTeamSplitOpenToMembers,
  useUpdateRacha,
} from "../../../../src/features/rachas/hooks";

export default function RachaSettings() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const { data: racha, isLoading } = useRacha(rachaId);
  const updateRacha = useUpdateRacha(rachaId);
  const setEvaluationsOpen = useSetEvaluationsOpen(rachaId);
  const setTeamSplitOpenToMembers = useSetTeamSplitOpenToMembers(rachaId);

  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [toggleError, setToggleError] = useState<unknown>(null);

  useEffect(() => {
    if (racha) {
      setName(racha.name);
      setSchedule(racha.schedule ?? "");
    }
  }, [racha]);

  if (isLoading || !racha) return <LoadingSpinner />;

  const onSave = async () => {
    setSubmitError(null);
    try {
      await updateRacha.mutateAsync({ name, schedule: schedule || undefined });
      router.back();
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer title="Configurações">
      <View className="gap-4">
        <TextField label="Nome" value={name} onChangeText={setName} />
        <TextField label="Dia e horário" value={schedule} onChangeText={setSchedule} />

        <ErrorView error={submitError} />

        <Button
          label={updateRacha.isPending ? "Salvando..." : "Salvar"}
          onPress={onSave}
          disabled={updateRacha.isPending}
        />
      </View>

      <View className="mt-8 gap-3">
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="font-medium text-charcoal dark:text-cream">Avaliação aberta</Text>
              <Text className="text-sm text-charcoal/60 dark:text-cream/60">
                Membros podem avaliar jogadores deste racha.
              </Text>
            </View>
            <Switch
              value={racha.evaluationsOpen}
              onValueChange={(value) => {
                setToggleError(null);
                setEvaluationsOpen.mutate(value, { onError: setToggleError });
              }}
              trackColor={{ true: "#D8A73C" }}
            />
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="font-medium text-charcoal dark:text-cream">
                Divisão de times aberta a membros
              </Text>
              <Text className="text-sm text-charcoal/60 dark:text-cream/60">
                Qualquer membro pode gerar a divisão, não só o admin.
              </Text>
            </View>
            <Switch
              value={racha.teamSplitOpenToMembers}
              onValueChange={(value) => {
                setToggleError(null);
                setTeamSplitOpenToMembers.mutate(value, { onError: setToggleError });
              }}
              trackColor={{ true: "#D8A73C" }}
            />
          </View>
        </Card>

        <ErrorView error={toggleError} />
      </View>
    </ScreenContainer>
  );
}
