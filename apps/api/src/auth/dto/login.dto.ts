import { createZodDto } from 'nestjs-zod';
import { loginSchema } from '@metanol/shared';

export class LoginDto extends createZodDto(loginSchema) {}
