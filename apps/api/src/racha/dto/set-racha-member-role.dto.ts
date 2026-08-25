import { createZodDto } from "nestjs-zod";
import { setRachaMemberRoleSchema } from "@metanol/shared";

export class SetRachaMemberRoleDto extends createZodDto(
  setRachaMemberRoleSchema.omit({ rachaId: true, userId: true }),
) {}
