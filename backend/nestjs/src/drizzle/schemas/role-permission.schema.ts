import { pgTable, primaryKey } from "drizzle-orm/pg-core";
import { RoleTable } from "./role.schema";
import { PermissionTable } from "./permission.schema";
import { relations } from "drizzle-orm";

export const RolePermissionTable = pgTable(
  "role_permissions",
  (table) => {
    return {
      roleId: table
        .uuid()
        .references(() => RoleTable.id)
        .notNull(),
      permissionId: table
        .uuid()
        .references(() => PermissionTable.id)
        .notNull(),
    };
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const RolePermissionRelations = relations(
  RolePermissionTable,
  ({ one }) => ({
    role: one(RoleTable, {
      fields: [RolePermissionTable.roleId],
      references: [RoleTable.id],
    }),
    permission: one(PermissionTable, {
      fields: [RolePermissionTable.permissionId],
      references: [PermissionTable.id],
    }),
  }),
);
