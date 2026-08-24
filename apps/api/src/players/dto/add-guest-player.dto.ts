import { createZodDto } from "nestjs-zod";
import { addGuestPlayerSchema } from "@metanol/shared";

export class AddGuestPlayerDto extends createZodDto(
  addGuestPlayerSchema.omit({ rachaId: true }),
) {}
