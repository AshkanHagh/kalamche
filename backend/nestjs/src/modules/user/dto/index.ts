import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const UpdateUserSchema = z.object({
  name: z.string().max(255),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
