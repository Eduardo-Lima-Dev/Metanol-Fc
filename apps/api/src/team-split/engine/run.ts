import type { GenerateTeamSplitInput } from '@metanol/shared';
import { createRandomChromosome, type Chromosome } from './chromosome';
import { computeTeamSizes } from './team-sizes';
import { calculateFitness, computeAttributeRanges } from './fitness';
import { tournamentSelect, onePointCrossover, repairChromosome, mutateByTranslocation } from './operators';

const TOURNAMENT_SIZE = 3;

export interface TeamSplitRunResult {
  chromosome: Chromosome;
  fitness: number;
}

// Loop principal do AG (RF05): modelo geracional com elitismo — a cada
// geração, o melhor indivíduo é preservado e o restante da população é
// substituído por filhos gerados via seleção, crossover+correção e mutação.
// Critério de parada: número fixo de gerações (RF05.6).
export function runGeneticAlgorithm(
  input: GenerateTeamSplitInput,
  rng: () => number = Math.random,
): TeamSplitRunResult {
  const { players, params } = input;
  const { numberOfTeams, playersPerTeam, weights, algorithm } = params;
  const { populationSize, generations, crossoverRate, mutationRate } = algorithm;

  const teamSizes = computeTeamSizes(numberOfTeams, playersPerTeam, players.length);
  const attributeRanges = computeAttributeRanges(players);

  const evaluate = (chromosome: Chromosome) =>
    calculateFitness(chromosome, players, numberOfTeams, weights, attributeRanges);

  let population: Chromosome[] = Array.from({ length: populationSize }, () =>
    createRandomChromosome(teamSizes, rng),
  );
  let fitnesses = population.map(evaluate);

  for (let generation = 0; generation < generations; generation++) {
    const eliteIndex = fitnesses.indexOf(Math.min(...fitnesses));
    const nextPopulation: Chromosome[] = [population[eliteIndex]];

    while (nextPopulation.length < populationSize) {
      const parentA = tournamentSelect(population, fitnesses, TOURNAMENT_SIZE, rng);
      const parentB = tournamentSelect(population, fitnesses, TOURNAMENT_SIZE, rng);

      let [childA, childB] =
        rng() < crossoverRate ? onePointCrossover(parentA, parentB, rng) : [parentA, parentB];

      childA = repairChromosome(childA, teamSizes, rng);
      childB = repairChromosome(childB, teamSizes, rng);

      if (rng() < mutationRate) childA = mutateByTranslocation(childA, rng);
      if (rng() < mutationRate) childB = mutateByTranslocation(childB, rng);

      nextPopulation.push(childA);
      if (nextPopulation.length < populationSize) nextPopulation.push(childB);
    }

    population = nextPopulation;
    fitnesses = population.map(evaluate);
  }

  const bestIndex = fitnesses.indexOf(Math.min(...fitnesses));
  return { chromosome: population[bestIndex], fitness: fitnesses[bestIndex] };
}
