// Cromossomo (RF05.2): vetor de tamanho N onde a posição i é o jogador i e o
// valor é o índice do time ao qual ele foi alocado.
export type Chromosome = number[];

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// População inicial (RF05.3): monta um "saco" com os rótulos de time já
// respeitando os tamanhos-alvo e embaralha para formar um cromossomo válido.
export function createRandomChromosome(teamSizes: number[], rng: () => number = Math.random): Chromosome {
  const labels: number[] = [];
  teamSizes.forEach((size, teamIndex) => {
    for (let i = 0; i < size; i++) labels.push(teamIndex);
  });
  return shuffle(labels, rng);
}
