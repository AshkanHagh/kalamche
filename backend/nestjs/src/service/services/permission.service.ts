import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CatchError } from "src/common/error/catch-error";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle";
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
    try {
      const defaultPermissionNames = ["user:read", "shop:read", "product:read"];

      const defaultPermissions =
        await this.connection.query.PermissionSchema.findMany({
          where: (table, funcs) =>
            funcs.inArray(table.name, defaultPermissionNames),
        });

      if (defaultPermissions.length === 0) {
        throw new BadRequestException("default permissions not found");
      }

      await this.connection.insert(UserPermissionSchema).values(
        defaultPermissions.map((permission) => ({
          permissionId: permission.id,
          userId,
        })),
      );
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const userPermissions =
        await this.connection.query.UserPermissionSchema.findMany({
          where: (table, funcs) => funcs.eq(table.userId, userId),
          with: {
            permission: {
              columns: { name: true },
            },
          },
        });

      return userPermissions.map((up) => up.permission.name);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
