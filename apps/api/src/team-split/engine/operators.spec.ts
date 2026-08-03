import { onePointCrossover, repairChromosome, mutateByTranslocation, tournamentSelect } from './operators';
import { seededRng } from './testing/seeded-rng';

function sequenceRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('repairChromosome', () => {
  it('always produces a chromosome matching the target team sizes', () => {
    const teamSizes = [3, 2, 2];
    const rng = seededRng(42);
    for (let trial = 0; trial < 50; trial++) {
      const broken = [0, 0, 0, 0, 0, 1, 2]; // 5 no time 0, 1 no time 1, 1 no time 2 (alvo: 3/2/2)
      const repaired = repairChromosome(broken, teamSizes, rng);
      const counts = teamSizes.map((_, team) => repaired.filter((t) => t === team).length);
      expect(counts).toEqual(teamSizes);
    }
  });
});

describe('onePointCrossover', () => {
  it('produces two children of the same length as the parents', () => {
    const rng = seededRng(7);
    const parentA = [0, 0, 1, 1];
    const parentB = [1, 1, 0, 0];
    const [childA, childB] = onePointCrossover(parentA, parentB, rng);
    expect(childA).toHaveLength(4);
    expect(childB).toHaveLength(4);
  });
});

describe('mutateByTranslocation', () => {
  it('swaps exactly two positions, preserving the multiset of team labels', () => {
    const rng = seededRng(1);
    const chromosome = [0, 0, 1, 1, 2, 2];
    const mutated = mutateByTranslocation(chromosome, rng);
    const diffCount = chromosome.filter((value, index) => value !== mutated[index]).length;
    expect(diffCount).toBe(2);
    expect([...mutated].sort()).toEqual([...chromosome].sort());
  });
});

describe('tournamentSelect', () => {
  it('returns the individual with the lowest fitness among the sampled pool', () => {
    const population = [[0], [1], [2]];
    const fitnesses = [5, 1, 9];
    // 3 sorteios controlados: índice 0 (fit 5), índice 1 (fit 1), índice 2 (fit 9)
    const rng = sequenceRng([0, 0.5, 0.9]);
    const selected = tournamentSelect(population, fitnesses, 3, rng);
    expect(selected).toEqual([1]);
  });
});
