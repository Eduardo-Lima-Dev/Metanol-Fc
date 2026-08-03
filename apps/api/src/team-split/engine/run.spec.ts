import type { GenerateTeamSplitInput } from '@metanol/shared';
import { runGeneticAlgorithm } from './run';
import { createRandomChromosome } from './chromosome';
import { computeTeamSizes } from './team-sizes';
import { calculateFitness, computeAttributeRanges } from './fitness';
import { seededRng } from './testing/seeded-rng';

function buildInput(): GenerateTeamSplitInput {
  return {
    players: [
      { id: 'p1', average: 5, goals: 10, assists: 8 },
      { id: 'p2', average: 1, goals: 0, assists: 0 },
      { id: 'p3', average: 4, goals: 8, assists: 6 },
      { id: 'p4', average: 2, goals: 1, assists: 1 },
      { id: 'p5', average: 3, goals: 5, assists: 4 },
      { id: 'p6', average: 3, goals: 4, assists: 3 },
    ],
    params: {
      numberOfTeams: 2,
      playersPerTeam: 3,
      weights: { average: 1, goals: 1, assists: 1 },
      algorithm: { populationSize: 20, generations: 30, crossoverRate: 0.8, mutationRate: 0.1 },
    },
  };
}

describe('runGeneticAlgorithm', () => {
  it('converges to a solution at least as good as a single random guess', () => {
    const input = buildInput();
    const teamSizes = computeTeamSizes(
      input.params.numberOfTeams,
      input.params.playersPerTeam,
      input.players.length,
    );
    const ranges = computeAttributeRanges(input.players);
    const randomGuessFitness = calculateFitness(
      createRandomChromosome(teamSizes, seededRng(999)),
      input.players,
      input.params.numberOfTeams,
      input.params.weights,
      ranges,
    );

    const result = runGeneticAlgorithm(input, seededRng(123));

    expect(result.fitness).toBeLessThanOrEqual(randomGuessFitness);
  });

  it('always returns a chromosome matching the configured target team sizes', () => {
    const input = buildInput();
    const result = runGeneticAlgorithm(input, seededRng(7));
    const counts = new Array<number>(input.params.numberOfTeams).fill(0);
    result.chromosome.forEach((team) => (counts[team] += 1));
    expect(counts).toEqual(
      computeTeamSizes(input.params.numberOfTeams, input.params.playersPerTeam, input.players.length),
    );
  });
});
