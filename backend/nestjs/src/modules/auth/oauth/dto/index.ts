import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const HandleCallbackSchema = z.object({
  provider: z.string(),
  code: z.string(),
  state: z.string(),
});

export class HandleCallbackDto extends createZodDto(HandleCallbackSchema) {}
