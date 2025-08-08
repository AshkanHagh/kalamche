import { createZodValidationPipe } from "nestjs-zod";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ZodError } from "zod";

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) =>
    new KalamcheError(
      KalamcheErrorType.InvalidBodyField,
      error.flatten().fieldErrors,
    ),
});
