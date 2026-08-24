import { createZodDto } from "nestjs-zod";
import { updatePlayerStatsSchema } from "@metanol/shared";

export class UpdatePlayerStatsDto extends createZodDto(updatePlayerStatsSchema) {}
