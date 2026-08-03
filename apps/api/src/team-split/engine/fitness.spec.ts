import type { TeamSplitPlayerInput, TeamSplitWeights } from '@metanol/shared';
import { calculateFitness, computeAttributeRanges } from './fitness';

const weights: TeamSplitWeights = { average: 1, goals: 1, assists: 1 };

function player(id: string, average: number, goals: number, assists: number): TeamSplitPlayerInput {
  return { id, average, goals, assists };
}

describe('calculateFitness', () => {
  it('is zero when all teams have identical attribute means', () => {
    const players = [player('a', 3, 2, 1), player('b', 3, 2, 1), player('c', 3, 2, 1), player('d', 3, 2, 1)];
    const chromosome = [0, 1, 0, 1];
    const ranges = computeAttributeRanges(players);
    expect(calculateFitness(chromosome, players, 2, weights, ranges)).toBe(0);
  });

  it('is higher for a lopsided split than for a balanced one', () => {
    const players = [player('a', 5, 10, 5), player('b', 0, 0, 0), player('c', 5, 10, 5), player('d', 0, 0, 0)];
    // [0,0,1,1]: cada time recebe 1 jogador forte (a/c) + 1 fraco (b/d) -> equilibrado
    const balanced = [0, 0, 1, 1];
    // [0,1,0,1]: um time fica só com os fortes (a,c), outro só com os fracos (b,d)
    const lopsided = [0, 1, 0, 1];
    const ranges = computeAttributeRanges(players);
    const balancedFitness = calculateFitness(balanced, players, 2, weights, ranges);
    const lopsidedFitness = calculateFitness(lopsided, players, 2, weights, ranges);
    expect(lopsidedFitness).toBeGreaterThan(balancedFitness);
  });

  it('ignores an attribute whose weight is zero (RF06.4)', () => {
    const players = [player('a', 5, 10, 3), player('b', 0, 0, 3)];
    const chromosome = [0, 1];
    const ranges = computeAttributeRanges(players);
    const fullWeights: TeamSplitWeights = { average: 1, goals: 1, assists: 1 };
    const onlyAssists: TeamSplitWeights = { average: 0, goals: 0, assists: 1 };

    expect(calculateFitness(chromosome, players, 2, fullWeights, ranges)).toBeGreaterThan(0);
    expect(calculateFitness(chromosome, players, 2, onlyAssists, ranges)).toBe(0);
  });
});
