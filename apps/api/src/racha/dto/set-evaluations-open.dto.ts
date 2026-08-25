import { createZodDto } from "nestjs-zod";
import { setEvaluationsOpenSchema } from "@metanol/shared";

export class SetEvaluationsOpenDto extends createZodDto(
  setEvaluationsOpenSchema.omit({ rachaId: true }),
) {}
