import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const parsedValue = this.schema.safeParse(value);
    if (!parsedValue.success) {
      throw new KalamcheError(
        KalamcheErrorType.InvalidBodyField,
        parsedValue.error,
      );
    }

    return parsedValue.data as unknown;
  }
}
