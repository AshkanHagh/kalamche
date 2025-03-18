import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle/constants";
import { UserPermissionSchema } from "src/drizzle/schema";
import { Postgres } from "src/drizzle/types";

@Injectable()
export class PermissionService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly connection: Postgres,
    private readonly config: ConfigService,
  ) {}

  public async createDefaultPermissionsForUser(userId: string): Promise<void> {
    const defaultPermissionNames = ["user:read", "shop:read", "product:read"];

    const defaultPermissions =
      await this.connection.query.PermissionSchema.findMany({
        where: (table, funcs) =>
          funcs.inArray(table.name, defaultPermissionNames),
      });

    // permissions always exists but for not crashing
    if (defaultPermissions.length === 0) {
      throw new InternalServerErrorException("default permissions not found");
    }

    await this.connection.insert(UserPermissionSchema).values(
      defaultPermissions.map((permission) => ({
        permissionId: permission.id,
        userId,
      })),
    );
  }

  public async getUserPermissions(userId: string): Promise<string[]> {
    const userPermissions =
      await this.connection.query.UserPermissionSchema.findMany({
        where: (table, funcs) => funcs.eq(table.userId, userId),
        with: {
          permission: {
            columns: { name: true },
          },
        },
      });

    if (!userPermissions || userPermissions.length === 0) {
      throw new InternalServerErrorException("user has no permissions");
    }
    return userPermissions.map((up) => up.permission.name);
  }
}
