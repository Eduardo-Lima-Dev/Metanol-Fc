import { createZodDto } from "nestjs-zod";
import { addRachaMemberSchema } from "@metanol/shared";

export class AddRachaMemberDto extends createZodDto(
  addRachaMemberSchema.omit({ rachaId: true }),
) {}
