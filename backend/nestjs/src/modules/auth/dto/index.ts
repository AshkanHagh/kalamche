import { z } from "zod";

export const RegisterDtoSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const ResendVerificationCodeSchema = z.object({
  email: z.string().email(),
});

export type ResendVerificationCodeDto = z.infer<
  typeof ResendVerificationCodeSchema
>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const VerifyEmailRegistrationSchema = z.object({
  code: z.number().min(100000).max(999999),
  token: z.string().max(500),
});

export type VerifyEmailRegistrationDto = z.infer<
  typeof VerifyEmailRegistrationSchema
>;
