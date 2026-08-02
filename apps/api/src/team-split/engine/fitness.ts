import type { TeamSplitPlayerInput, TeamSplitWeights } from '@metanol/shared';
import type { Chromosome } from './chromosome';

type Attribute = 'average' | 'goals' | 'assists';
const ATTRIBUTES: Attribute[] = ['average', 'goals', 'assists'];

export type AttributeRanges = Record<Attribute, number>;

// Amplitude de cada atributo entre os jogadores presentes, calculada uma única
// vez antes do AG rodar. Normaliza a escala de average (0-5) contra goals/assists
// (inteiros sem limite superior) para que os pesos configuráveis (RF06.4) tenham
// efeito previsível independente da escala de cada atributo.
export function computeAttributeRanges(players: TeamSplitPlayerInput[]): AttributeRanges {
  const ranges = {} as AttributeRanges;
  for (const attr of ATTRIBUTES) {
    const values = players.map((p) => p[attr]);
    const range = Math.max(...values) - Math.min(...values);
    ranges[attr] = range > 0 ? range : 1;
  }
  return ranges;
}

// Fitness de minimização (RF05.4): soma, para cada atributo, a diferença
// (normalizada e ponderada) entre as médias de todos os pares de times.
// Quanto mais próximo de zero, mais equilibrados estão os times.
export function calculateFitness(
  chromosome: Chromosome,
  players: TeamSplitPlayerInput[],
  numberOfTeams: number,
  weights: TeamSplitWeights,
  attributeRanges: AttributeRanges,
): number {
  const sums: Record<Attribute, number[]> = {
    average: new Array(numberOfTeams).fill(0),
    goals: new Array(numberOfTeams).fill(0),
    assists: new Array(numberOfTeams).fill(0),
  };
  const counts = new Array<number>(numberOfTeams).fill(0);

  chromosome.forEach((team, index) => {
    const player = players[index];
    counts[team] += 1;
    for (const attr of ATTRIBUTES) sums[attr][team] += player[attr];
  });

  let fitness = 0;
  for (const attr of ATTRIBUTES) {
    const means = sums[attr].map((sum, team) => (counts[team] > 0 ? sum / counts[team] : 0));
    let imbalance = 0;
    for (let i = 0; i < means.length; i++) {
      for (let j = i + 1; j < means.length; j++) {
        imbalance += Math.abs(means[i] - means[j]);
      }
    }
    fitness += weights[attr] * (imbalance / attributeRanges[attr]);
  }
  return fitness;
}
