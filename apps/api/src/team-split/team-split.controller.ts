import { Body, Controller, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request';
import { RachaAdminGuard } from 'src/racha/guards/racha-role.guard';
import { TeamSplitService } from './team-split.service';
import { CreateTeamSplitDto } from './dto/create-team-split.dto';

@Controller('rachas/:rachaId/team-splits')
@UseGuards(JwtAuthGuard, RachaAdminGuard)
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
