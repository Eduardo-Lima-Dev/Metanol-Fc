import { Module } from '@nestjs/common';
import { PlayersModule } from '../players/players.module';
import { TeamSplitController } from './team-split.controller';
import { TeamSplitService } from './team-split.service';
import { TeamSplitHistoryController } from './history/team-split-history.controller';
import { TeamSplitHistoryService } from './history/team-split-history.service';

@Module({
  imports: [PlayersModule],
  controllers: [TeamSplitController, TeamSplitHistoryController],
  providers: [TeamSplitService, TeamSplitHistoryService],
})
export class TeamSplitModule {}
