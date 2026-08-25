import { createZodDto } from "nestjs-zod";
import { findUserByEmailQuerySchema } from "@metanol/shared";

export class FindUserByEmailDto extends createZodDto(findUserByEmailQuerySchema) {}
