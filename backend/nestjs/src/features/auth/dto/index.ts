import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const RegisterDtoSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/),
});

export type RegisterPayload = z.infer<typeof RegisterDtoSchema>;
export class RegisterDto extends createZodDto(RegisterDtoSchema) {}

export const ResendVerificationCodeSchema = z.object({
  email: z.string().email(),
});

export type ResendVerificationCodePayload = z.infer<
  typeof ResendVerificationCodeSchema
>;
export class ResendVerificationCodeDto extends createZodDto(
  ResendVerificationCodeSchema,
) {}

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/),
});

export type LoginPayload = z.infer<typeof LoginSchema>;
export class LoginDto extends createZodDto(LoginSchema) {}

export const VerifyEmailRegistrationSchema = z.object({
  code: z.number().min(100000).max(999999),
  token: z.string().max(500),
});

export type VerifyEmailRegistrationPayload = z.infer<
  typeof VerifyEmailRegistrationSchema
>;
export class VerifyEmailRegistrationDto extends createZodDto(
  VerifyEmailRegistrationSchema,
) {}
