import { pgTable } from "drizzle-orm/pg-core";
import { InferSelectModel, relations } from "drizzle-orm";
import { UserPermissionSchema } from "./user-permission.schema";

export const PermissionSchema = pgTable("permissions", (table) => ({
  id: table.bigserial({ mode: "number" }).primaryKey(),
  name: table.varchar({ length: 50 }).notNull().unique(),
}));

export const PermissionTableRelations = relations(
  PermissionSchema,
  ({ many }) => ({
    user: many(UserPermissionSchema, {
      relationName: "fk_user_permission_user",
    }),
  }),
);

export type Permission = InferSelectModel<typeof PermissionSchema>;
