import { Body, Controller, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { TeamSplitService } from './team-split.service';
import { CreateTeamSplitDto } from './dto/create-team-split.dto';
import { TeamSplitGenerateGuard } from './guards/team-split-generate.guard';

@Controller('rachas/:rachaId/team-splits')
@UseGuards(JwtAuthGuard, TeamSplitGenerateGuard)
export class TeamSplitController {
  constructor(private readonly teamSplitService: TeamSplitService) {}

  @Post('generate')
  @HttpCode(201)
  generate(
    @Param('rachaId') rachaId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTeamSplitDto,
  ) {
    return this.teamSplitService.generate(rachaId, req.user.id, dto);
  }
}
