import { createPool } from "..";
import * as schema from "../schema";

export async function seedDefaultPermissions() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const defaultPermissions = ["shop:read", "user:read", "product:read"];
  const connection = createPool();

  await connection.insert(schema.PermissionSchema).values(
    defaultPermissions.map((permission) => ({
      name: permission,
    })),
  );
}
