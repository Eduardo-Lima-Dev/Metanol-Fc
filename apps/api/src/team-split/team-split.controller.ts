import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import type { TeamSplitResult } from '@metanol/shared';
import { TeamSplitService } from './team-split.service';
import { GenerateTeamSplitDto } from './dto/generate-team-split.dto';

@Controller('team-split')
export class TeamSplitController {
  constructor(private readonly teamSplitService: TeamSplitService) {}

  @Post('generate')
  @HttpCode(200)
  generate(@Body() dto: GenerateTeamSplitDto): TeamSplitResult {
    return this.teamSplitService.generate(dto);
  }
}
