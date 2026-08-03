import { Injectable } from '@nestjs/common';
import type { GenerateTeamSplitInput, TeamSplitResult, Team } from '@metanol/shared';
import { runGeneticAlgorithm } from './engine/run';

@Injectable()
export class TeamSplitService {
  generate(input: GenerateTeamSplitInput): TeamSplitResult {
    const { chromosome, fitness } = runGeneticAlgorithm(input);

    const teams: Team[] = Array.from({ length: input.params.numberOfTeams }, (_, index) => ({
      index,
      playerIds: input.players
        .filter((_, playerIndex) => chromosome[playerIndex] === index)
        .map((player) => player.id),
    }));

    return {
      teams,
      bestFitness: fitness,
      params: input.params,
    };
  }
}
