import { z } from "zod";
import { PAYMENT_METHODS } from "../constants";
import { createZodDto } from "nestjs-zod";

export const CreateCheckoutSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  planId: z.string().uuid(),
});

export type CreateCheckoutPayload = z.infer<typeof CreateCheckoutSchema>;
export class CreateCheckoutDto extends createZodDto(CreateCheckoutSchema) {}

export const VerifyPaymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  status: z.enum(["OK", "NOK"]).optional(),
  referenceId: z.string(),
});

export type VerifyPaymentPayload = z.infer<typeof VerifyPaymentSchema>;
export class VerifyPaymentDto extends createZodDto(VerifyPaymentSchema) {}
