import type { Chromosome } from './chromosome';

// Seleção por torneio (RF05.5): sorteia `tournamentSize` indivíduos e retorna
// o de menor fitness (o problema é de minimização).
export function tournamentSelect(
  population: Chromosome[],
  fitnesses: number[],
  tournamentSize: number,
  rng: () => number,
): Chromosome {
  let bestIndex = Math.floor(rng() * population.length);
  for (let i = 1; i < tournamentSize; i++) {
    const candidate = Math.floor(rng() * population.length);
    if (fitnesses[candidate] < fitnesses[bestIndex]) bestIndex = candidate;
  }
  return population[bestIndex];
}

// Crossover de 1 ponto (RF05.5): gera 2 filhos combinando os pais a partir de
// um ponto de corte aleatório. Os filhos ainda precisam ser corrigidos
// (ver `repairChromosome`) antes de serem considerados válidos.
export function onePointCrossover(
  parentA: Chromosome,
  parentB: Chromosome,
  rng: () => number,
): [Chromosome, Chromosome] {
  const length = parentA.length;
  const cutPoint = 1 + Math.floor(rng() * Math.max(length - 1, 1));
  const childA = [...parentA.slice(0, cutPoint), ...parentB.slice(cutPoint)];
  const childB = [...parentB.slice(0, cutPoint), ...parentA.slice(cutPoint)];
  return [childA, childB];
}

// Correção pós-crossover (RF05.5): após o corte, um time pode ficar com mais
// jogadores do que o tamanho-alvo e outro com menos. Move jogadores de times
// "sobrando" para times "faltando", um por vez, até bater com `teamSizes`.
export function repairChromosome(chromosome: Chromosome, teamSizes: number[], rng: () => number): Chromosome {
  const repaired = [...chromosome];
  const counts = new Array<number>(teamSizes.length).fill(0);
  repaired.forEach((team) => (counts[team] += 1));

  const findOverfull = () => counts.findIndex((count, team) => count > teamSizes[team]);
  const findUnderfull = () => counts.findIndex((count, team) => count < teamSizes[team]);

  let overfullTeam = findOverfull();
  let underfullTeam = findUnderfull();
  while (overfullTeam !== -1 && underfullTeam !== -1) {
    const candidates = repaired.reduce<number[]>((acc, team, index) => {
      if (team === overfullTeam) acc.push(index);
      return acc;
    }, []);
    const chosenIndex = candidates[Math.floor(rng() * candidates.length)];
    repaired[chosenIndex] = underfullTeam;
    counts[overfullTeam] -= 1;
    counts[underfullTeam] += 1;

    overfullTeam = findOverfull();
    underfullTeam = findUnderfull();
  }

  return repaired;
}

// Mutação por translocação (RF05.5/RF06.3): troca o time de dois jogadores
// entre si, preservando automaticamente os tamanhos-alvo de cada time.
export function mutateByTranslocation(chromosome: Chromosome, rng: () => number): Chromosome {
  if (chromosome.length < 2) return [...chromosome];

  const mutated = [...chromosome];
  const posA = Math.floor(rng() * mutated.length);
  let posB = Math.floor(rng() * mutated.length);
  while (posB === posA) posB = Math.floor(rng() * mutated.length);

  [mutated[posA], mutated[posB]] = [mutated[posB], mutated[posA]];
  return mutated;
}
