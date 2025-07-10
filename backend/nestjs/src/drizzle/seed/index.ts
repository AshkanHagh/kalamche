import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schemas";
import csv from "csv-parser";
import fs from "node:fs";
import path from "node:path";
import { LazadaProduct, ProductSpecification } from "./types";
import {
  Database,
  IProductInsertForm,
  IShop,
  IShopInsertForm,
  IUser,
  IUserInsertForm,
} from "../types";
import { faker } from "@faker-js/faker";
import { USER_ROLE } from "src/constants/global.constant";

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
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: parseInt(faker.location.zipCode()),
      taxId: faker.finance.iban(),
      status: faker.helpers.arrayElement(["pending", "active", "closed"]),
    }));
  });

  return await db.insert(schema.ShopTable).values(insertForms).returning();
}

// TODO: move csv files to s3
async function seedProducts(db: Database, shops: IShop[]) {
  console.log("Seeding products");

  const productsInsertForm: IProductInsertForm[] = [];

  const datasetPath = path.join(
    __dirname,
    "..",
    "..",
    "assets/datasets/lazada-products.csv",
  );

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(datasetPath)
      .pipe(csv({ separator: "," }))
      .on("data", (record: LazadaProduct) => {
        const parsedSpec = JSON.parse(
          record.product_specifications,
        ) as ProductSpecification[];
        const productSpecification = parsedSpec.map((specification) => ({
          key: specification.name,
          value: specification.value,
        }));

        for (const shop of shops) {
          const productPrice = parseInt(record.final_price);
          const finalPrice =
            faker.number.int({ min: 1, max: 5 }) * productPrice;

          const insertForm: IProductInsertForm = {
            shopId: shop.id,
            categories: JSON.parse(record.breadcrumb) as string[],
            description: record.product_description,
            name: record.title,
            status: "public",
            price: finalPrice,
            specifications: productSpecification,
            website: record.domain,
            brand: record.brand,
          };
          productsInsertForm.push(insertForm);
        }
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
}

main();
