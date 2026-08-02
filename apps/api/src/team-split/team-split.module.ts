import { Module } from '@nestjs/common';
import { TeamSplitController } from './team-split.controller';
import { TeamSplitService } from './team-split.service';

@Module({
  controllers: [TeamSplitController],
  providers: [TeamSplitService],
})
export class TeamSplitModule {}
