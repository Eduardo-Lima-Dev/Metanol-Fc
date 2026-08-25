import { createZodDto } from "nestjs-zod";
import { recordTeamSplitPlayerStatsSchema } from "@metanol/shared";

export class RecordTeamSplitPlayerStatsDto extends createZodDto(
  recordTeamSplitPlayerStatsSchema,
) {}
