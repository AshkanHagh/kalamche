import { pgTable } from "drizzle-orm/pg-core";
import { RoleSchema } from "./role";
import { relations } from "drizzle-orm";
import { UserSchema } from "./user";

export const UserRoleSchema = pgTable("user_roles", (table) => ({
  userId: table
    .uuid()
    .primaryKey()
    .references(() => UserSchema.id),
  roleId: table
    .uuid()
    .primaryKey()
    .references(() => RoleSchema.id),
}));

export const UserRoleRelatiosn = relations(UserRoleSchema, ({ one }) => ({
  user: one(UserSchema, {
    fields: [UserRoleSchema.userId],
    references: [UserSchema.id],
  }),
  role: one(RoleSchema, {
    fields: [UserRoleSchema.userId],
    references: [RoleSchema.id],
  }),
}));
