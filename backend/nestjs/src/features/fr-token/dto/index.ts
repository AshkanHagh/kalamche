import { z } from "zod";
import { PAYMENT_METHODS } from "../constants";

export const CreateCheckoutSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  planId: z.string().uuid(),
});

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;

export const VerifyPaymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  status: z.enum(["OK", "NOK"]).optional(),
  referenceId: z.string(),
});

export type VerifyPaymentDto = z.infer<typeof VerifyPaymentSchema>;
