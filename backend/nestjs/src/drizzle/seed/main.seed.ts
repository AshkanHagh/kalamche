import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schemas";
import {
  IProductInsertForm,
  IProductOfferInsertForm,
  IShop,
  IShopInsertForm,
  IUser,
  IUserInsertForm,
} from "../schemas";
import csv from "csv-parser";
import fs from "node:fs";
import { AmazonProduct } from "./types";
import { Database } from "../types";
import { faker } from "@faker-js/faker";
import { FrTokenPlanDatasets } from "src/assets/datasets/fr-token-plans";
import { BrandTable, IBrand, IBrandInsertForm } from "../schemas/brand.schema";
import {
  CategoryTable,
  ICategory,
  ICategoryInsertForm,
} from "../schemas/category.schema";
import { randomUUID } from "node:crypto";
import { CSV_PATH } from "./constants";
import { USER_ROLE } from "../constants";

async function main() {
  console.log("Start seeding");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema, casing: "snake_case" });

  await db.transaction(async (tx) => {
    const users = await seedUsers(tx);
    const shops = await seedShops(tx, users);
    await seedProducts(tx, shops);
    await seedFrTokenPlans(tx);
  });

  console.log("Seeding completed");
  await pool.end();
  process.exit(0);
}

async function seedBrandAndCategories(tx: Database) {
  const brands: { key: string; slug: string }[] = [];
  const categories: { key: string; slug: string }[][] = [];
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv({ separator: "," }))
      .on("data", (record: AmazonProduct) => {
        brands.push({
          key: record.brand,
          slug: record.brand.toLowerCase().replace(/[ '&]+/g, "-"),
        });

        categories.push(
          (JSON.parse(record.categories) as string[]).map((category) => ({
            key: category,
            slug: category.toLowerCase().replace(/[ '&]+/g, "-"),
          })),
        );
      })
      .on("end", () => {
        console.log("Parsed CSV");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error parsing CSV:", err.message);
        reject(err);
      });
  });

  const [brandMap, categoryMap] = await Promise.all([
    seedBrands(tx, brands),
    seedCategories(tx, categories),
  ]);
  return {
    brandMap,
    categoryMap,
  };
}

async function seedBrands(
  tx: Database,
  brandDatasets: { key: string; slug: string }[],
) {
  console.log("Seeding brands");

  const form: IBrandInsertForm[] = brandDatasets.map((brand) => ({
    name: brand.key,
    slug: brand.slug,
  }));
  const brands = await tx.insert(BrandTable).values(form).returning();

  const brandMap = new Map<string, IBrand>();
  brands.forEach((brand) => brandMap.set(brand.name, brand));

  return brandMap;
}

async function seedCategories(
  tx: Database,
  categoryDatasets: { key: string; slug: string }[][],
) {
  console.log("Seeding categories");

  const categoryMap = new Map<string, ICategory>();
  const insertForm: ICategoryInsertForm[] = [];

  for (const arr of categoryDatasets) {
    let parentId: string | null = null;
    let path = "";

    for (let level = 0; level < arr.length; level++) {
      const name = arr[level].key;
      const currentPath = path ? `${path}/${name}` : name;

      if (!categoryMap.has(currentPath)) {
        const id = randomUUID();
        const form = {
          id,
          level,
          name,
          parentId,
          path: currentPath,
          slug: arr[level].slug,
        };

        insertForm.push(form);
        categoryMap.set(currentPath, form);
      }

      parentId = categoryMap.get(currentPath)!.id;
      path = currentPath;
    }
  }

  const batchSize = 50;
  for (let i = 0; i < insertForm.length; i += batchSize) {
    const batch = insertForm.slice(i, i + batchSize);
    await tx.insert(CategoryTable).values(batch);
  }

  return categoryMap;
}

async function seedUsers(db: Database) {
  console.log("Seeding users");

  const insertForms: IUserInsertForm[] = Array.from({ length: 10 }).map(() => ({
    id: crypto.randomUUID(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    roles: [USER_ROLE.ADMIN],
  }));

  const users = await db
    .insert(schema.UserTable)
    .values(insertForms)
    .returning();

  await Promise.all([
    users.map(async (user) => {
      await db.insert(schema.WalletTable).values({
        tokens: faker.number.int({ min: 1, max: 100 }),
        userId: user.id,
      });
    }),
  ]);

  return users;
}

async function seedShops(db: Database, users: IUser[]) {
  console.log("Seeding shops");

  const insertForms: IShopInsertForm[] = users.flatMap((user) => {
    return Array.from({
      length: faker.number.int({ min: 0, max: 3 }),
    }).map(() => ({
      userId: user.id,
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      email: faker.internet.email(),
      emailVerifiedAt: faker.date.recent({ days: 30 }),
      phone: faker.phone.number(),
      website: faker.internet.url(),
      streetAddress: faker.location.streetAddress(),
      country: faker.location.country(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      status: faker.helpers.arrayElement(["pending", "verified", "denied"]),
    }));
  });

  return await db.insert(schema.ShopTable).values(insertForms).returning();
}

// TODO: move csv files to s3
async function seedProducts(db: Database, shops: IShop[]) {
  console.log("Seeding products");

  const { brandMap, categoryMap } = await seedBrandAndCategories(db);

  const productsInsertForm: IProductInsertForm[] = [];
  const productOffersForm: IProductOfferInsertForm[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv({ separator: "," }))
      .on("data", (record: AmazonProduct) => {
        const productSpecification = Array.from({ length: 5 }).map(() => ({
          key: faker.word.sample(),
          value: faker.word.sample(),
        }));

        const randomShop =
          shops[faker.number.int({ min: 0, max: shops.length - 1 })];

        // Parse categories and find the deepest category
        const categories = JSON.parse(record.categories) as string[];
        const deepestCategoryPath = categories.join("/");
        const deepestCategory = categoryMap.get(deepestCategoryPath)!;

        const insertForm: IProductInsertForm = {
          id: crypto.randomUUID(),
          shopId: randomShop.id,
          description: record.description,
          title: record.title,
          specifications: productSpecification,
          categoryId: deepestCategory.id,
          brandId: brandMap.get(record.brand)!.id,
          asin: record.asin,
          modelNumber: record.model_number,
          upc: faker.string.numeric({ length: 12 }),
          status: "public",
          initialPrice: parseInt(record?.initial_price || "10"),
        };
        productsInsertForm.push(insertForm);
      })
      .on("end", () => {
        console.log("Parsed CSV");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error parsing CSV:", err.message);
        reject(err);
      });
  });

  const batchSize = 30;
  for (let i = 0; i < productsInsertForm.length; i += batchSize) {
    const records = productsInsertForm.slice(i, i + batchSize);
    await db.insert(schema.ProductTable).values(records).execute();
  }

  productsInsertForm.forEach((product) => {
    // Each product has 1 offer from the owning shop
    productOffersForm.push({
      productId: product.id!,
      shopId: product.shopId!,
      finalPrice: faker.number.float({ min: 10, max: 1000 }),
      title: product.title,
      pageUrl: faker.internet.url(),
      status: "active",
      byboxWinner: true,
    });

    // Randomly select 1-5 additional shops to offer prices
    const otherShops = shops.filter((shop) => shop.id !== product.shopId);
    const numOffers = faker.number.int({ min: 1, max: 5 });
    const selectedShops = faker.helpers.shuffle(otherShops).slice(0, numOffers);
    selectedShops.forEach((shop) => {
      productOffersForm.push({
        productId: product.id!,
        shopId: shop.id,
        finalPrice: faker.number.float({ min: 10, max: 1000 }),
        title: product.title,
        pageUrl: faker.internet.url(),
        status: faker.helpers.arrayElement(["active", "inactive"]),
        byboxWinner: false,
      });
    });
  });

  for (let i = 0; i < productOffersForm.length; i += batchSize) {
    const records = productOffersForm.slice(i, i + batchSize);
    await db.insert(schema.ProductOfferTable).values(records).execute();
  }
}

async function seedFrTokenPlans(db: Database) {
  await db.insert(schema.FrTokenPlanTable).values(FrTokenPlanDatasets);
}

main();
