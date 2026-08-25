export interface ParsedAverageLine {
  line: number;
  raw: string;
  identifier?: string;
  average?: number;
  error?: string;
}

/**
 * Parseia o `.txt` de médias (RF03.4.1): uma linha por jogador, no formato
 * `identificador;media` (identificador = e-mail ou apelido do usuário; média
 * de 0 a 5, aceitando vírgula decimal). Linhas vazias ou iniciadas com `#`
 * são ignoradas. Erros são reportados por linha em vez de abortar o arquivo
 * inteiro no primeiro problema.
 */
export function parsePlayerAveragesFile(content: string): ParsedAverageLine[] {
  return content
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, line: index + 1 }))
    .filter(({ raw }) => raw.trim().length > 0 && !raw.trim().startsWith("#"))
    .map(({ raw, line }) => {
      const parts = raw.split(";").map((part) => part.trim());
      if (parts.length !== 2) {
        return { line, raw, error: "Formato esperado: identificador;media" };
      }

      const [identifier, averageRaw] = parts;
      if (!identifier) {
        return { line, raw, error: "Identificador ausente" };
      }

      const average = Number(averageRaw.replace(",", "."));
      if (Number.isNaN(average)) {
        return { line, raw, identifier, error: "Média inválida" };
      }
      if (average < 0 || average > 5) {
        return { line, raw, identifier, error: "Média deve estar entre 0 e 5" };
      }

      return { line, raw, identifier, average };
    });
}
