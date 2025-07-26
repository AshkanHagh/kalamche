import { z } from "zod";
import { PAYMENT_METHODS } from "../constants";

export const CreateCheckoutSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  planId: z.string().uuid(),
});

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;
