import { createZodDto } from 'nestjs-zod';
import { registerUserSchema } from '@metanol/shared';

export class RegisterDto extends createZodDto(registerUserSchema) {}
