import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { UserSchema } from "./user.schema";
import { PermissionSchema } from "./permission.schema";

export const UserPermissionSchema = pgTable("user_permissions", (table) => ({
  permissionId: table
    .bigserial({ mode: "number" })
    .references(() => PermissionSchema.id, { onDelete: "cascade" })
    .notNull(),
  userId: table
    .bigserial({ mode: "number" })
    .references(() => UserSchema.id, { onDelete: "cascade" })
    .notNull(),
}));

export const UserRoleTableRelations = relations(
  UserPermissionSchema,
  ({ one }) => ({
    user: one(UserSchema, {
      fields: [UserPermissionSchema.userId],
      references: [UserSchema.id],
      relationName: "fk_user_permission_user",
    }),
    permission: one(PermissionSchema, {
      fields: [UserPermissionSchema.permissionId],
      references: [PermissionSchema.id],
      relationName: "fk_user_permission_permission",
    }),
  }),
);
