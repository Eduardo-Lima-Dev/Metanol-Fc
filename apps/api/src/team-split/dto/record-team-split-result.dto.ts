import { createZodDto } from "nestjs-zod";
import { recordTeamSplitResultSchema } from "@metanol/shared";

export class RecordTeamSplitResultDto extends createZodDto(recordTeamSplitResultSchema) {}
