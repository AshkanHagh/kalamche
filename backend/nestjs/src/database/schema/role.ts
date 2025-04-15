import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { UserRoleSchema } from "./user-role";
import { RolePermissionSchema } from "./role-permission";

export const RoleSchema = pgTable("roles", (table) => ({
  id: table.uuid().primaryKey().defaultRandom(),
  name: table.varchar({ length: 50 }).notNull(),
  description: table.varchar({ length: 500 }).notNull(),
}));

export const RoleRelations = relations(RoleSchema, ({ many }) => ({
  userRole: many(UserRoleSchema),
  rolePermission: many(RolePermissionSchema),
}));
