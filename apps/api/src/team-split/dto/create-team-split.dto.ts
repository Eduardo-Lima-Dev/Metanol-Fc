import { createZodDto } from "nestjs-zod";
import { createTeamSplitSchema } from "@metanol/shared";

export class CreateTeamSplitDto extends createZodDto(
  createTeamSplitSchema.omit({ rachaId: true }),
) {}
