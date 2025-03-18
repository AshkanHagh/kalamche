import * as schema from "../schema";
import { Postgres } from "../types";

export async function seedDefaultPermissions(db: Postgres) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const defaultPermissions = ["shop:read", "user:read", "product:read"];

  await db
    .insert(schema.PermissionSchema)
    .values(
      defaultPermissions.map((permission) => ({
        name: permission,
      })),
    )
    .onConflictDoNothing();
}
