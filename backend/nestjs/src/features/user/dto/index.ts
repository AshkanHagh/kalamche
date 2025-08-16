import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateUserSchema = z.object({
  name: z.string().max(255),
});

export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
