import { createZodDto } from "nestjs-zod";
import { updateUserProfileSchema } from "@metanol/shared";

export class UpdateUserProfileDto extends createZodDto(updateUserProfileSchema) {}
