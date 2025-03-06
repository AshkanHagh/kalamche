import * as schema from "../schema";
import { seedConnection } from "./connection";

export async function permissionsSeed() {
  await new Promise((resolve) => setTimeout(resolve, 20000));
  const userPermissions = ["shop:read", "user:read", "product:read"];
  const connection = seedConnection();

  await connection.insert(schema.PermissionSchema).values(
    userPermissions.map((permission) => ({
      name: permission,
    })),
  );
}
