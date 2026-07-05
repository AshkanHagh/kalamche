import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { PAYMENT_METHODS } from "src/drizzle/constants";

const CreateCheckoutSchema = z.object({
  provider: z.enum(PAYMENT_METHODS),
  planId: z.string().uuid(),
});

export class CreateCheckoutDto extends createZodDto(CreateCheckoutSchema) {}

const VerifyPaymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  referenceId: z.string(),
});

export class VerifyPaymentDto extends createZodDto(VerifyPaymentSchema) {}
