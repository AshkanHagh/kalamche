import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const ImageUsage = pgEnum("image_for_types", ["shop", "product"]);

export const AnonymouseImageTable = pgTable("anonymouse_images", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    usage: ImageUsage().notNull(),
    url: table.text().notNull(),
    isThumbnail: table.boolean().default(false),
    createdAt,
  };
});

export const AnonymouesImageRelations = relations(
  AnonymouseImageTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [AnonymouseImageTable.userId],
      references: [UserTable.id],
    }),
  }),
);
