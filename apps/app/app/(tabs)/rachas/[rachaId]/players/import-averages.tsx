import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "../../../../../src/components/ScreenContainer";
import { Button } from "../../../../../src/components/Button";
import { Card } from "../../../../../src/components/Card";
import { TextField } from "../../../../../src/components/TextField";
import { ErrorView } from "../../../../../src/components/ErrorView";
import {
  type ImportAveragesResult,
  useImportAverages,
  useImportAveragesText,
} from "../../../../../src/features/players/hooks";

const FORMAT_EXAMPLE = "voce@exemplo.com;4.5\napelido-do-jogador;3,5\n# linhas com # são ignoradas";

export default function ImportAverages() {
  const { rachaId } = useLocalSearchParams<{ rachaId: string }>();
  const router = useRouter();
  const importAverages = useImportAverages(rachaId);
  const importAveragesText = useImportAveragesText(rachaId);

  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedContent, setPastedContent] = useState("");
  const [results, setResults] = useState<ImportAveragesResult[] | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const isPending = importAverages.isPending || importAveragesText.isPending;

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
      setResults(response);
    } catch (error) {
      setSubmitError(error);
    }
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setPastedContent(text);
  };

  const submitPastedContent = async () => {
    setSubmitError(null);
    setResults(null);

    if (!pastedContent.trim()) {
      setSubmitError(new Error("Cole ou digite as médias antes de enviar."));
      return;
    }

    try {
      const response = await importAveragesText.mutateAsync(pastedContent);
      setResults(response);
    } catch (error) {
      setSubmitError(error);
    }
  };

  return (
    <ScreenContainer title="Importar médias">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text className="text-sm font-medium text-charcoal dark:text-cream">
            Como formatar
          </Text>
          <Text className="mt-1 text-sm text-charcoal/70 dark:text-cream/70">
            Uma linha por jogador, no formato identificador;média — o identificador é o e-mail ou
            apelido do jogador cadastrado, e a média vai de 0 a 5 (aceita vírgula ou ponto).
          </Text>
          <Text className="mt-3 rounded-xl bg-charcoal/5 px-3 py-2 font-mono text-xs text-charcoal dark:bg-cream/5 dark:text-cream">
            {FORMAT_EXAMPLE}
          </Text>
        </Card>

        <View className="mt-6 gap-3">
          <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
            Selecionar arquivo
          </Text>
          <Button
            label={fileName ?? "Selecionar arquivo .txt"}
            onPress={pickAndUpload}
            variant="secondary"
            disabled={isPending}
          />
        </View>

        <View className="mt-6 gap-3">
          <Text className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
            Ou colar médias
          </Text>
          <TextField
            label="Conteúdo"
            value={pastedContent}
            onChangeText={setPastedContent}
            placeholder={FORMAT_EXAMPLE}
            multiline
            numberOfLines={6}
            autoCapitalize="none"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Colar da área de transferência"
                onPress={pasteFromClipboard}
                variant="secondary"
                disabled={isPending}
              />
            </View>
            <View className="flex-1">
              <Button
                label={importAveragesText.isPending ? "Enviando..." : "Enviar"}
                onPress={submitPastedContent}
                disabled={isPending}
              />
            </View>
          </View>
        </View>

        <View className="mt-6 mb-8 gap-4">
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
      </ScrollView>
    </ScreenContainer>
  );
}
