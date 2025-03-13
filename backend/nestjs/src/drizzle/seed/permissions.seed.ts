import { createDrizzleConnection } from "..";
import * as schema from "../schema";

export async function seedDefaultPermissions() {
  // wait for migratoin to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const defaultPermissions = ["shop:read", "user:read", "product:read"];
  const connection = createDrizzleConnection();

  await connection
    .insert(schema.PermissionSchema)
    .values(
      defaultPermissions.map((permission) => ({
        name: permission,
      })),
    )
    .onConflictDoNothing();
}
