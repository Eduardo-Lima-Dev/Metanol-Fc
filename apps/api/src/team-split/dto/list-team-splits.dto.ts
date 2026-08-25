import { createZodDto } from "nestjs-zod";
import { paginationQuerySchema } from "@metanol/shared";

export class ListTeamSplitsDto extends createZodDto(paginationQuerySchema) {}
