import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  nickname: z.string().min(1).optional(),
  email: z.string().email(),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;

export const registerUserSchema = z.object({
  name: z.string().min(1),
  nickname: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateUserProfileSchema = z.object({
  name: z.string().min(1).optional(),
  nickname: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
});
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
