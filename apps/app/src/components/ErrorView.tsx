import { Text, View } from "react-native";
import { ApiError } from "../core/api/apiError";

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return "Não foi possível completar a operação. Tente novamente.";
  return "Ocorreu um erro inesperado.";
}

export function ErrorView({ error }: { error: unknown }) {
  if (!error) return null;

  return (
    <View className="rounded-xl bg-red-500/10 px-4 py-3">
      <Text className="text-sm text-red-500">{errorMessage(error)}</Text>
    </View>
  );
}
