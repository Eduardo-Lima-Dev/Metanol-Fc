import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Alert, FlatList, Text, View } from "react-native";
import type { RachaMemberWithUser } from "@metanol/shared";
import { ScreenContainer } from "../../../../src/components/ScreenContainer";
import { TextField } from "../../../../src/components/TextField";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { ErrorView } from "../../../../src/components/ErrorView";
import { LoadingSpinner } from "../../../../src/components/LoadingSpinner";
import {
  useAddRachaMember,
  useRachaMembers,
  useRachaRole,
  useRemoveRachaMember,
  useSetRachaMemberRole,
} from "../../../../src/features/rachas/hooks";
import { useFindUserByEmail } from "../../../../src/features/users/hooks";
import { useAuth } from "../../../../src/core/auth/AuthProvider";

function MemberRow({
  member,
  isViewerAdmin,
  isSelf,
  onPromote,
  onDemote,
  onRemove,
}: {
  member: RachaMemberWithUser;
  isViewerAdmin: boolean;
  isSelf: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-semibold text-charcoal dark:text-cream">
            {member.nickname ?? member.name}
            {isSelf ? " (você)" : ""}
          </Text>
          <Text className="text-sm text-charcoal/60 dark:text-cream/60">{member.email}</Text>
        </View>
        <View className="rounded-full bg-gold/15 px-3 py-1">
          <Text className="text-xs font-semibold text-gold">
            {member.role === "admin" ? "Admin" : "Membro"}
          </Text>
        </View>
      </View>

      {isViewerAdmin ? (
        <View className="mt-3 flex-row gap-2">
          {member.role === "member" ? (
            <Button label="Promover" onPress={onPromote} variant="secondary" />
          ) : (
            <Button label="Rebaixar" onPress={onDemote} variant="secondary" />
          )}
          <Button label="Remover" onPress={onRemove} variant="secondary" />
        </View>
      ) : null}
    </Card>
  );
}

export default function RachaMembers() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const { user } = useAuth();
  const role = useRachaRole(rachaId);
  const isViewerAdmin = role === "admin";

  const { data: members, isLoading, error } = useRachaMembers(rachaId);
  const findUserByEmail = useFindUserByEmail();
  const addMember = useAddRachaMember(rachaId);
  const removeMember = useRemoveRachaMember(rachaId);
  const setMemberRole = useSetRachaMemberRole(rachaId);

  const [email, setEmail] = useState("");
  const [addError, setAddError] = useState<unknown>(null);

  const onAdd = async () => {
    setAddError(null);
    try {
      const found = await findUserByEmail.mutateAsync(email.trim());
      await addMember.mutateAsync(found.id);
      setEmail("");
    } catch (err) {
      setAddError(err);
    }
  };

  const confirmRemove = (member: RachaMemberWithUser) => {
    Alert.alert("Remover membro", `Remover ${member.nickname ?? member.name} do racha?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => removeMember.mutate(member.userId),
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text className="mt-16 text-3xl font-bold text-charcoal dark:text-cream">Membros</Text>

      {isViewerAdmin ? (
        <View className="mt-4 gap-3">
          <TextField
            label="Adicionar por e-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="pessoa@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <ErrorView error={addError} />
          <Button
            label={findUserByEmail.isPending || addMember.isPending ? "Adicionando..." : "Adicionar"}
            onPress={onAdd}
            disabled={!email.trim() || findUserByEmail.isPending || addMember.isPending}
          />
        </View>
      ) : null}

      {isLoading ? <LoadingSpinner /> : null}
      {error ? (
        <View className="mt-4">
          <ErrorView error={error} />
        </View>
      ) : null}

      {members ? (
        <FlatList
          className="mt-4"
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item }) => (
            <MemberRow
              member={item}
              isViewerAdmin={isViewerAdmin}
              isSelf={item.userId === user?.id}
              onPromote={() => setMemberRole.mutate({ userId: item.userId, role: "admin" })}
              onDemote={() => setMemberRole.mutate({ userId: item.userId, role: "member" })}
              onRemove={() => confirmRemove(item)}
            />
          )}
        />
      ) : null}
    </ScreenContainer>
  );
}
