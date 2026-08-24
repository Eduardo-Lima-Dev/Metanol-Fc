import { createZodDto } from "nestjs-zod";
import { createRachaSchema } from "@metanol/shared";

export class CreateRachaDto extends createZodDto(createRachaSchema) {}
