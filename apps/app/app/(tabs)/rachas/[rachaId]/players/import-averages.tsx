import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Text, View } from "react-native";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Button } from "../../../../../src/components/Button";
import { ErrorView } from "../../../../../src/components/ErrorView";
import { useImportAverages } from "../../../../../src/features/players/hooks";

type ImportAveragesResult = {
  line: number;
  identifier?: string;
  status: "ok" | "error";
  message?: string;
};

export default function ImportAverages() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const importAverages = useImportAverages(rachaId);

  const [fileName, setFileName] = useState<string | null>(null);
  const [results, setResults] = useState<ImportAveragesResult[] | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const pickAndUpload = async () => {
    setSubmitError(null);
    setResults(null);

    const picked = await DocumentPicker.getDocumentAsync({
      type: "text/plain",
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets[0]) return;

    const asset = picked.assets[0];
    setFileName(asset.name);

    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: asset.name,
      type: "text/plain",
    } as unknown as Blob);

    try {
      const response = await importAverages.mutateAsync(formData);
      setResults(response as ImportAveragesResult[]);
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer
      title="Importar médias"
      subtitle="Arquivo .txt com uma linha por jogador: identificador;media (e-mail ou apelido; média de 0 a 5)."
    >
      <View className="gap-4">
        <Button
          label={fileName ?? "Selecionar arquivo .txt"}
          onPress={pickAndUpload}
          variant="secondary"
          disabled={importAverages.isPending}
        />

        <ErrorView error={submitError} />

        {results ? (
          <View className="gap-2">
            {results.map((result) => (
              <View
                key={`${result.line}-${result.identifier ?? ""}`}
                className={`rounded-xl px-4 py-3 ${
                  result.status === "ok" ? "bg-gold/10" : "bg-red-500/10"
                }`}
              >
                <Text
                  className={`text-sm ${result.status === "ok" ? "text-gold" : "text-red-500"}`}
                >
                  Linha {result.line} · {result.identifier ?? "—"} ·{" "}
                  {result.status === "ok" ? "Importado" : (result.message ?? "Erro")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Button label="Voltar" onPress={() => router.back()} variant="secondary" />
      </View>
    </ScreenContainer>
  );
}
