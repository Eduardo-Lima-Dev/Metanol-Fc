import { createZodDto } from "nestjs-zod";
import { setTeamSplitOpenToMembersSchema } from "@metanol/shared";

export class SetTeamSplitOpenToMembersDto extends createZodDto(
  setTeamSplitOpenToMembersSchema.omit({ rachaId: true }),
) {}
