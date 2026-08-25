import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guards";
import type { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { RachaMemberGuard } from "../racha/guards/racha-role.guard";
import { EvaluationsService } from "./evaluations.service";
import { CreateEvaluationDto } from "./dto/create-evaluation.dto";

@Controller("rachas/:rachaId/evaluations")
@UseGuards(JwtAuthGuard, RachaMemberGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  create(
    @Param("rachaId") rachaId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateEvaluationDto,
  ) {
    return this.evaluationsService.create(rachaId, req.user.id, dto);
  }
}
