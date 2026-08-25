import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guards";
import type { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { RachaAdminGuard, RachaMemberGuard } from "./guards/racha-role.guard";
import { RachaService } from "./racha.service";
import { CreateRachaDto } from "./dto/create-racha.dto";
import { UpdateRachaDto } from "./dto/update-racha.dto";
import { SetEvaluationsOpenDto } from "./dto/set-evaluations-open.dto";
import { SetTeamSplitOpenToMembersDto } from "./dto/set-team-split-open-to-members.dto";
import { AddRachaMemberDto } from "./dto/add-racha-member.dto";
import { SetRachaMemberRoleDto } from "./dto/set-racha-member-role.dto";

@Controller("rachas")
@UseGuards(JwtAuthGuard)
export class RachaController {
  constructor(private readonly rachaService: RachaService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateRachaDto) {
    return this.rachaService.create(req.user.id, dto);
  }

  @Get()
  findAllForUser(@Req() req: AuthenticatedRequest) {
    return this.rachaService.findAllForUser(req.user.id);
  }

  // Convite por link (RF02 extra) — precisa vir antes de ":rachaId" pra não
  // ser interpretado como um id de racha.
  @Post("invite/:inviteCode/join")
  @HttpCode(200)
  joinByInviteCode(
    @Param("inviteCode") inviteCode: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.rachaService.joinByInviteCode(inviteCode, req.user.id);
  }

  @Get(":rachaId")
  @UseGuards(RachaMemberGuard)
  findOne(@Param("rachaId") rachaId: string) {
    return this.rachaService.findOne(rachaId);
  }

  @Patch(":rachaId")
  @UseGuards(RachaAdminGuard)
  update(@Param("rachaId") rachaId: string, @Body() dto: UpdateRachaDto) {
    return this.rachaService.update(rachaId, dto);
  }

  @Patch(":rachaId/evaluations-open")
  @UseGuards(RachaAdminGuard)
  setEvaluationsOpen(
    @Param("rachaId") rachaId: string,
    @Body() dto: SetEvaluationsOpenDto,
  ) {
    return this.rachaService.setEvaluationsOpen(rachaId, dto.open);
  }

  @Patch(":rachaId/team-split-open-to-members")
  @UseGuards(RachaAdminGuard)
  setTeamSplitOpenToMembers(
    @Param("rachaId") rachaId: string,
    @Body() dto: SetTeamSplitOpenToMembersDto,
  ) {
    return this.rachaService.setTeamSplitOpenToMembers(rachaId, dto.open);
  }

  @Post(":rachaId/invite/regenerate")
  @UseGuards(RachaAdminGuard)
  regenerateInviteCode(@Param("rachaId") rachaId: string) {
    return this.rachaService.regenerateInviteCode(rachaId);
  }

  @Get(":rachaId/members")
  @UseGuards(RachaMemberGuard)
  listMembers(@Param("rachaId") rachaId: string) {
    return this.rachaService.listMembers(rachaId);
  }

  @Post(":rachaId/members")
  @UseGuards(RachaAdminGuard)
  addMember(@Param("rachaId") rachaId: string, @Body() dto: AddRachaMemberDto) {
    return this.rachaService.addMember(rachaId, dto.userId);
  }

  @Delete(":rachaId/members/:userId")
  @HttpCode(200)
  @UseGuards(RachaAdminGuard)
  async removeMember(
    @Param("rachaId") rachaId: string,
    @Param("userId") userId: string,
  ) {
    await this.rachaService.removeMember(rachaId, userId);
    return { message: "Membro removido do racha" };
  }

  @Patch(":rachaId/members/:userId/role")
  @UseGuards(RachaAdminGuard)
  setMemberRole(
    @Param("rachaId") rachaId: string,
    @Param("userId") userId: string,
    @Body() dto: SetRachaMemberRoleDto,
  ) {
    return this.rachaService.setMemberRole(rachaId, userId, dto.role);
  }
}
