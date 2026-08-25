import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guards";
import type { AuthenticatedRequest } from "src/auth/types/authenticated-request";
import { RachaAdminGuard, RachaMemberGuard } from "src/racha/guards/racha-role.guard";
import { TeamSplitHistoryService } from "./team-split-history.service";
import { ListTeamSplitsDto } from "../dto/list-team-splits.dto";
import { RecordTeamSplitResultDto } from "../dto/record-team-split-result.dto";
import { RecordTeamSplitPlayerStatsDto } from "../dto/record-team-split-player-stats.dto";

@Controller("rachas/:rachaId/team-splits")
@UseGuards(JwtAuthGuard, RachaMemberGuard)
export class TeamSplitHistoryController {
  constructor(private readonly historyService: TeamSplitHistoryService) {}

  @Get()
  findMany(@Param("rachaId") rachaId: string, @Query() query: ListTeamSplitsDto) {
    return this.historyService.findMany(rachaId, query);
  }

  // Precisa vir antes de ":teamSplitId" — senão "ranking" seria interpretado
  // como um id de divisão.
  @Get("ranking")
  getPlayerRanking(@Param("rachaId") rachaId: string) {
    return this.historyService.getPlayerRanking(rachaId);
  }

  @Get(":teamSplitId")
  findOne(@Param("rachaId") rachaId: string, @Param("teamSplitId") teamSplitId: string) {
    return this.historyService.findOne(rachaId, teamSplitId);
  }

  @Patch(":teamSplitId/result")
  @UseGuards(RachaAdminGuard)
  recordResult(
    @Param("rachaId") rachaId: string,
    @Param("teamSplitId") teamSplitId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RecordTeamSplitResultDto,
  ) {
    return this.historyService.recordResult(rachaId, teamSplitId, req.user.id, dto);
  }

  @Patch(":teamSplitId/player-stats")
  @UseGuards(RachaAdminGuard)
  recordPlayerStats(
    @Param("rachaId") rachaId: string,
    @Param("teamSplitId") teamSplitId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RecordTeamSplitPlayerStatsDto,
  ) {
    return this.historyService.recordPlayerStats(rachaId, teamSplitId, req.user.id, dto);
  }
}
