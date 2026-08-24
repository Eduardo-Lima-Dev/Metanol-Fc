import { Module } from '@nestjs/common';
import { TeamSplitController } from './team-split.controller';
import { TeamSplitService } from './team-split.service';
import { TeamSplitHistoryController } from './history/team-split-history.controller';
import { TeamSplitHistoryService } from './history/team-split-history.service';

@Module({
  controllers: [TeamSplitController, TeamSplitHistoryController],
  providers: [TeamSplitService, TeamSplitHistoryService],
})
export class TeamSplitModule {}
