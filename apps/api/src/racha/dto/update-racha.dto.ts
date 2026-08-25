import { createZodDto } from "nestjs-zod";
import { updateRachaSchema } from "@metanol/shared";

export class UpdateRachaDto extends createZodDto(updateRachaSchema) {}
