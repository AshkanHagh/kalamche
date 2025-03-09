import * as schema from "../schema";
import { seedConnection } from "./connection";

export async function seedDefaultPermissions() {
  await new Promise((resolve) => setTimeout(resolve, 20000));
  const defaultPermissions = ["shop:read", "user:read", "product:read"];
  const connection = seedConnection();

  await connection.insert(schema.PermissionSchema).values(
    defaultPermissions.map((permission) => ({
      name: permission,
    })),
  );
}
