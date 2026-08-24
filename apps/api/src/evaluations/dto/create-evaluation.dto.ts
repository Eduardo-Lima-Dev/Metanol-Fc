import { createZodDto } from "nestjs-zod";
import { createEvaluationObjectSchema } from "@metanol/shared";

export class CreateEvaluationDto extends createZodDto(
  createEvaluationObjectSchema.omit({ rachaId: true, evaluatorPlayerId: true }),
) {}
