import { pgTable } from "drizzle-orm/pg-core";
import { RoleSchema } from "./role";
import { PermissionSchema } from "./permission";
import { relations } from "drizzle-orm";

export const RolePermissionSchema = pgTable("role_permissions", (table) => ({
  roleId: table
    .uuid()
    .primaryKey()
    .references(() => RoleSchema.id),
  permissionId: table
    .uuid()
    .primaryKey()
    .references(() => PermissionSchema.id),
}));

export const RolePermissionRelations = relations(
  RolePermissionSchema,
  ({ one }) => ({
    role: one(RoleSchema, {
      fields: [RolePermissionSchema.roleId],
      references: [RoleSchema.id],
    }),
    permission: one(PermissionSchema, {
      fields: [RolePermissionSchema.permissionId],
      references: [PermissionSchema.id],
    }),
  }),
);
