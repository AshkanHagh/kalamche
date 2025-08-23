import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { getTableName, sql } from "drizzle-orm";
import { Database } from "src/drizzle/types";
import {
  BrandTable,
  CategoryTable,
  IProductInsertForm,
  IShopUpdateForm,
  IUserUpdateForm,
  ProductTable,
  ShopTable,
  UserTable,
} from "src/drizzle/schemas";
import { faker } from "@faker-js/faker";
import { USER_ROLE } from "src/drizzle/constants";

export async function createNestAppInstance(): Promise<TestingModule> {
  process.env.NODE_ENV = "test";

  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return module;
}

export async function truncateTables(db: Database, ...tables: any[]) {
  await db.transaction(async (tx) => {
    const queries = tables.map((table) => {
      // eslint-disable-next-line
      const tableName = getTableName(table);
      return sql.raw(`TRUNCATE ${tableName} CASCADE`);
    });

    for (const query of queries) {
      await tx.execute(query);
    }
  });
}

export async function createShop(db: Database, form: IShopUpdateForm) {
  // create a complete shop
  const [shop] = await db
    .insert(ShopTable)
    .values({
      userId: form.userId!,
      email: form.email ?? faker.internet.email(),
      name: form.name ?? faker.company.name(),
      phone: form.phone ?? faker.phone.number(),
      website: form.website ?? faker.internet.url(),
      country: form.country ?? faker.location.country(),
      description: form.description ?? faker.lorem.paragraph(),
      state: form.state ?? faker.location.state(),
      streetAddress: form.streetAddress ?? faker.location.streetAddress(),
      zipCode: form.zipCode ?? faker.location.zipCode(),
      imageUrl: form.imageUrl ?? faker.image.avatar(),
      status: form.status ?? "verified",
      city: form.city ?? faker.location.city(),
      id: form.id,
    })
    .returning();

  return shop;
}

export async function createProduct(
  db: Database,
  form: Partial<IProductInsertForm>,
) {
  // Add brand and category to reference in the product table
  const [brand] = await db
    .insert(BrandTable)
    .values({
      name: faker.commerce.product(),
      slug: faker.commerce.product().replace(/\s+/g, "-").toLowerCase(),
    })
    .returning();
  const [category] = await db
    .insert(CategoryTable)
    .values({
      name: faker.commerce.product(),
      slug: faker.commerce.product().replace(/\s+/g, "-").toLowerCase(),
      path: faker.commerce.product(),
      level: 0,
    })
    .returning();

  const [product] = await db
    .insert(ProductTable)
    .values({
      asin: form.asin ?? "",
      brandId: brand.id,
      categoryId: category.id,
      description: form.description ?? faker.commerce.productDescription(),
      initialPrice: form.initialPrice ?? +faker.commerce.price(),
      modelNumber: form.modelNumber ?? faker.commerce.isbn(),
      specifications: form.specifications ?? [
        { key: "brand", value: faker.commerce.product() },
      ],
      title: form.title ?? faker.commerce.productName(),
      status: form.status ?? "public",
      shopId: form.shopId,
      id: form.id,
    })
    .returning();

  return product;
}

export async function createUser(db: Database, form: IUserUpdateForm) {
  const [newUser] = await db
    .insert(UserTable)
    .values({
      email: form.email || faker.internet.email(),
      name: form.name || faker.person.fullName(),
      roles: form.roles || [USER_ROLE.USER],
      id: form.id,
      passwordHash: form.passwordHash,
    })
    .returning();
  return newUser;
}
