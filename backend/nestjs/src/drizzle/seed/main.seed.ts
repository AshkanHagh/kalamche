import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schemas";
import csv from "csv-parser";
import fs from "node:fs";
import path from "node:path";
import { AmazonProduct } from "./types";
import {
  Database,
  IProductInsertForm,
  IProductOfferInsertForm,
  IShop,
  IShopInsertForm,
  IUser,
  IUserInsertForm,
} from "../types";
import { faker } from "@faker-js/faker";
import { USER_ROLE } from "src/constants/global.constant";
import { FrTokenPlanDatasets } from "src/assets/datasets/fr-token-plans";

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

async function seedUsers(db: Database) {
  console.log("Seeding users");

  const users: IUserInsertForm[] = Array.from({ length: 10 }).map(() => ({
    id: crypto.randomUUID(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    roles: [USER_ROLE.ADMIN],
  }));

  return await db.insert(schema.UserTable).values(users).returning();
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
      status: faker.helpers.arrayElement(["pending", "active", "closed"]),
    }));
  });

  return await db.insert(schema.ShopTable).values(insertForms).returning();
}

// TODO: move csv files to s3
async function seedProducts(db: Database, shops: IShop[]) {
  console.log("Seeding products");

  const productsInsertForm: IProductInsertForm[] = [];
  const productOffersForm: IProductOfferInsertForm[] = [];

  const datasetPath = path.join(
    __dirname,
    "..",
    "..",
    "assets/datasets/amazon-products.csv",
  );

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(datasetPath)
      .pipe(csv({ separator: "," }))
      .on("data", (record: AmazonProduct) => {
        const productSpecification = Array.from({ length: 5 }).map(() => ({
          key: faker.word.sample(),
          value: faker.word.sample(),
        }));

        const randomShop =
          shops[faker.number.int({ min: 0, max: shops.length - 1 })];
        const insertForm: IProductInsertForm = {
          id: crypto.randomUUID(),
          shopId: randomShop.id,
          categories: JSON.parse(record.categories) as string[],
          description: record.description,
          title: record.title,
          specifications: productSpecification,
          websiteUrl: record.url,
          brand: record.brand,
          asin: record.asin,
          modelNumber: record.model_number,
          upc: faker.string.numeric({ length: 12 }),
          views: faker.number.int({ min: 1, max: 10_000 }),
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
      shopId: product.shopId,
      finalPrice: faker.number.float({ min: 10, max: 1000 }),
      title: product.title,
      pageUrl: product.websiteUrl,
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
        pageUrl: product.websiteUrl,
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
