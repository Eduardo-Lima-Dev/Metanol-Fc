import { createZodDto } from 'nestjs-zod';
import { generateTeamSplitSchema } from '@metanol/shared';

export class GenerateTeamSplitDto extends createZodDto(generateTeamSplitSchema) {}
