import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { RolePermissionSchema } from "./role-permission";

export const PermissionSchema = pgTable("permissions", (table) => ({
  id: table.uuid().primaryKey().defaultRandom(),
  name: table.varchar({ length: 50 }).notNull(),
  resource: table.varchar({ length: 50 }).notNull(),
  action: table.varchar({ length: 50 }).notNull(),
}));

export const PermissionRelations = relations(PermissionSchema, ({ many }) => ({
  rolePermission: many(RolePermissionSchema),
}));
