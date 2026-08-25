import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guards";
import { RachaMemberGuard } from "src/racha/guards/racha-role.guard";
import { TeamSplitHistoryService } from "./team-split-history.service";
import { ListTeamSplitsDto } from "../dto/list-team-splits.dto";

@Controller("rachas/:rachaId/team-splits")
@UseGuards(JwtAuthGuard, RachaMemberGuard)
export class TeamSplitHistoryController {
  constructor(private readonly historyService: TeamSplitHistoryService) {}

  @Get()
  findMany(@Param("rachaId") rachaId: string, @Query() query: ListTeamSplitsDto) {
    return this.historyService.findMany(rachaId, query);
  }

  @Get(":teamSplitId")
  findOne(@Param("rachaId") rachaId: string, @Param("teamSplitId") teamSplitId: string) {
    return this.historyService.findOne(rachaId, teamSplitId);
  }
}
