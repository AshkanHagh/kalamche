import { Test, TestingModule } from "@nestjs/testing";
import { sql } from "drizzle-orm";
import { ConfigModule } from "src/config/config.module";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { migration } from "src/drizzle/migration";
import { InsertUser, UserSchema } from "src/drizzle/schema";
import { seedDefaultPermissions } from "src/drizzle/seed/permissions.seed";
import { Postgres } from "src/drizzle/types";
import { PermissionService } from "./permission.service";
import { v4 as uuid } from "uuid";

describe("PermissionService", () => {
  let app: TestingModule;
  let connection: Postgres;
  let config: ConfigService;
  let permissionService: PermissionService;

  const testUser: InsertUser = {
    email: "test.integration@example.com",
    name: "Test Integration User",
    avatarUrl: "https://example.com/test-avatar.jpg",
    id: uuid(),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [DrizzleModule.forTest(), ConfigModule],
      providers: [PermissionService],
    }).compile();

    connection = app.get<Postgres>(DATABASE_CONNECTION);
    config = app.get<ConfigService>(ConfigService);
    permissionService = app.get<PermissionService>(PermissionService);
  });

  beforeEach(async () => {
    await migration();

    await Promise.all([
      connection.execute(sql`TRUNCATE TABLE permissions CASCADE`),
      connection.execute(sql`TRUNCATE TABLE users CASCADE`),
      config.systemOpitons.cacheSterategy.clear(),
    ]);

    await seedDefaultPermissions();
    await connection.insert(UserSchema).values(testUser);
  });

  describe("createDefaultPermissionsForUser", () => {
    it("should create user basic permissions", async () => {
      expect(
        await permissionService.createDefaultPermissionsForUser(testUser.id!),
      ).toBeUndefined();

      const permissionsObj =
        await connection.query.UserPermissionSchema.findMany({
          where: (table, funcs) => funcs.eq(table.userId, testUser.id!),
          with: {
            permission: {
              columns: { name: true },
            },
          },
        });

      const permissions = permissionsObj.map(
        (permission) => permission.permission.name,
      );

      const defaultPermissions = ["shop:read", "user:read", "product:read"];
      defaultPermissions.map((permission) => {
        expect(permissions.includes(permission)).toBeTruthy();
      });
    });
  });

  describe("getUserPermissions", () => {
    it("should reutrn user permissions in string array", async () => {
      expect(
        await permissionService.createDefaultPermissionsForUser(testUser.id!),
      ).toBeUndefined();

      const userPermissions = await permissionService.getUserPermissions(
        testUser.id!,
      );
      expect(userPermissions).toBeDefined();

      const defaultPermissions = ["shop:read", "user:read", "product:read"];
      defaultPermissions.forEach((permission) => {
        expect(userPermissions.includes(permission)).toBeTruthy();
      });
    });

    it("should throw error on permission not found", async () => {
      await expect(
        permissionService.getUserPermissions(uuid()),
      ).rejects.toThrow();
    });
  });

  afterAll(async () => {
    await Promise.all([
      app.close(),
      config.systemOpitons.cacheSterategy.close(),
    ]);
  });
});
