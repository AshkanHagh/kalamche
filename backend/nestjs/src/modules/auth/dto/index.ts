import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const RegisterDtoSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/),
});

export class RegisterDto extends createZodDto(RegisterDtoSchema) {}

const ResendVerificationCodeSchema = z.object({
  email: z.string().email(),
});

export class ResendVerificationCodeDto extends createZodDto(
  ResendVerificationCodeSchema,
) {}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/),
});

export class LoginDto extends createZodDto(LoginSchema) {}

const VerifyEmailRegistrationSchema = z.object({
  code: z.number().min(100000).max(999999),
  token: z.string().max(500),
});

export class VerifyEmailRegistrationDto extends createZodDto(
  VerifyEmailRegistrationSchema,
) {}
