import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { getTableName, sql } from "drizzle-orm";
import { Database, IShopUpdateForm, IUserUpdateForm } from "src/drizzle/types";
import {
  BrandTable,
  CategoryTable,
  IBrandInsertForm,
  ICategoryInsertForm,
  IProductInsertForm,
  ProductTable,
  ShopTable,
  UserTable,
} from "src/drizzle/schemas";
import { faker } from "@faker-js/faker/.";
import { USER_ROLE } from "src/constants/global.constant";
import { BrandDatasets } from "src/assets/datasets/brands";
import { CategoryDatasets } from "src/assets/datasets/categories";

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
  const brandId = form.categoryId || (await createBrand(db)).id;
  const categoryId = form.brandId || (await createCategory(db)).id;

  const [product] = await db
    .insert(ProductTable)
    .values({
      asin: form.asin ?? "",
      brandId,
      categoryId,
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

export async function createCategory(
  db: Database,
  form?: Partial<ICategoryInsertForm>,
) {
  const categoryName = CategoryDatasets[0][0].key;
  const [category] = await db
    .insert(CategoryTable)
    .values({
      name: form?.name || categoryName,
      path: form?.path || categoryName,
      level: form?.level || 0,
      id: form?.id || faker.string.uuid(),
      parentId: form?.parentId || null,
    })
    .returning();

  return category;
}

export async function createBrand(
  db: Database,
  form?: Partial<IBrandInsertForm>,
) {
  const brandName = BrandDatasets[0].key;
  const [brand] = await db
    .insert(BrandTable)
    .values({
      name: form?.name || brandName,
      id: form?.id || brandName,
    })
    .returning();

  return brand;
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
