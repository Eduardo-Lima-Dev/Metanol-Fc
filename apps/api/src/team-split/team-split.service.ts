import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayersService } from '../players/players.service';
import type {
  CreateTeamSplitInput,
  Team,
  TeamSplitPlayerInput,
} from '@metanol/shared';
import { runGeneticAlgorithm } from './engine/run';
import { TeamSplitHistoryService } from './history/team-split-history.service';

type CreateTeamSplitBody = Omit<CreateTeamSplitInput, 'rachaId'>;

@Injectable()
export class TeamSplitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playersService: PlayersService,
    private readonly teamSplitHistoryService: TeamSplitHistoryService,
  ) {}

  async generate(rachaId: string, createdBy: string, input: CreateTeamSplitBody) {
    const players = await this.prisma.player.findMany({
      where: { rachaId, id: { in: input.presentPlayerIds } },
    });
    if (players.length !== input.presentPlayerIds.length) {
      throw new BadRequestException('Um ou mais jogadores informados não pertencem a este racha');
    }

    const averages = await this.playersService.computeEffectiveAverages(
      rachaId,
      input.presentPlayerIds,
    );

    // Jogador sem avaliação pública e sem média manual ainda: 0 é o fallback
    // mais conservador até existir uma fonte de média (RF03.4) para ele.
    const teamSplitPlayers: TeamSplitPlayerInput[] = players.map((player) => ({
      id: player.id,
      average: averages.get(player.id) ?? 0,
      goals: player.goals,
      assists: player.assists,
    }));

    const { chromosome, fitness } = runGeneticAlgorithm({
      players: teamSplitPlayers,
      params: input.params,
    });

    const teams: Team[] = Array.from({ length: input.params.numberOfTeams }, (_, index) => ({
      index,
      playerIds: teamSplitPlayers
        .filter((_, playerIndex) => chromosome[playerIndex] === index)
        .map((player) => player.id),
    }));

    const record = await this.teamSplitHistoryService.create(
      rachaId,
      createdBy,
      input.params,
      teams,
    );

    return {
      id: record.id,
      createdAt: record.createdAt,
      teams,
      bestFitness: fitness,
      params: input.params,
    };
  }
}
