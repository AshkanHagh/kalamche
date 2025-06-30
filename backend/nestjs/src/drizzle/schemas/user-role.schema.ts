import { pgTable } from "drizzle-orm/pg-core";
import { UserTable } from "./user.schema";
import { RoleTable } from "./role.schema";
import { relations } from "drizzle-orm";

export const UserRoleTable = pgTable("user_roles", (table) => {
  return {
    userId: table.uuid().references(() => UserTable.id),
    roleId: table
      .uuid()
      .references(() => RoleTable.id, { onDelete: "cascade" }),
  };
});

export const UserRoleRelations = relations(UserRoleTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserRoleTable.userId],
    references: [UserTable.id],
  }),
  role: one(RoleTable, {
    fields: [UserRoleTable.userId],
    references: [RoleTable.id],
  }),
}));
