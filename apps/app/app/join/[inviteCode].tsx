import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { Button } from "../../src/components/Button";
import { Logo } from "../../src/components/Logo";
import { ErrorView } from "../../src/components/ErrorView";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { useAuth } from "../../src/core/auth/AuthProvider";
import { useJoinRachaByInvite } from "../../src/features/rachas/hooks";

export default function JoinRacha() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();
  const router = useRouter();
  const { status } = useAuth();
  const joinRacha = useJoinRachaByInvite();
  const [error, setError] = useState<unknown>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !inviteCode || attempted.current) return;
    attempted.current = true;

    joinRacha
      .mutateAsync(inviteCode)
      .then((racha) => {
        router.replace(`/(tabs)/rachas/${racha.id}`);
      })
      .catch((err) => {
        setError(err);
      });
  }, [status, inviteCode]);

  if (status === "loading") return <LoadingSpinner />;

  if (status === "unauthenticated") {
    return (
      <ScreenContainer>
        <View className="mt-16 items-center gap-4">
          <Logo size={104} />
          <Text className="text-center text-2xl font-bold text-charcoal dark:text-cream">
            Você foi convidado pra um racha!
          </Text>
          <Text className="text-center text-charcoal/60 dark:text-cream/60">
            Crie sua conta ou entre com a que já tem pra participar.
          </Text>

          <View className="mt-4 w-full gap-3">
            <Button
              label="Criar conta"
              onPress={() =>
                router.push({ pathname: "/(auth)/register", params: { inviteCode } })
              }
            />
            <Button
              label="Já tenho conta"
              onPress={() => router.push({ pathname: "/(auth)/login", params: { inviteCode } })}
              variant="secondary"
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View className="mt-16 gap-4">
          <ErrorView error={error} />
          <Button label="Ir para meus rachas" onPress={() => router.replace("/(tabs)/rachas")} />
        </View>
      </ScreenContainer>
    );
  }

  return <LoadingSpinner />;
}
