import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schemas";
import {
  IProductInsertForm,
  IProductOfferInsertForm,
  IShop,
  IShopInsertForm,
  IUser,
  ProductImageInsertForm,
  BrandTable,
  IBrand,
  IBrandInsertForm,
} from "../schemas";
import csv from "csv-parser";
import fs from "node:fs";
import { Database } from "../types";
import { faker } from "@faker-js/faker";
import {
  CategoryTable,
  ICategory,
  ICategoryInsertForm,
} from "../schemas/category.schema";
import { randomUUID } from "node:crypto";
import { USER_ROLE } from "src/constants/global.constant";
import { join } from "node:path";
import { FrTokenPlanDatasets } from "src/assets/datasets/fr-token-plans";
import { indexProductsToSearch } from "./search-index";

type Spec = {
  key: string;
  value: string;
};

export type AmazonProduct = {
  brand: string;
  category: string;
  categories: string;
  title: string;
  description: string;
  asin: string;
  model_number: string;
  upc: string;
  initial_price: string;
  final_price: string;
  buybox_price: string;
  number_of_sellers: string;
  specifications: string;
};

export const CSV_PATH = join(
  __dirname,
  "..",
  "..",
  "assets/datasets/products.csv",
);
async function main() {
  console.log("Start seeding");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema, casing: "snake_case" });

  await db.transaction(async (tx) => {
    const users = await insertUsers(tx);
    const shops = await insertShops(tx, users);
    await insertProductsAndOffers(tx, users, shops);
    await seedFrTokenPlans(tx);
    await indexProductsToSearch(tx);
  });
  console.log("Seeding completed");
  await pool.end();
  process.exit(0);
}

function readProductsCsv(path: string): Promise<AmazonProduct[]> {
  return new Promise((resolve, reject) => {
    const records: AmazonProduct[] = [];
    fs.createReadStream(path)
      .pipe(csv({ separator: "," }))
      .on("data", (record: AmazonProduct) => records.push(record))
      .on("end", () => {
        console.log("Parsed CSV");
        resolve(records);
      })
      .on("error", (err) => {
        console.error("Error parsing CSV:", err.message);
        reject(err);
      });
  });
}

async function insertBrands(db: Database, names: string[]) {
  console.log("Seeding brands");

  const unique = [...new Set(names)];
  const form: IBrandInsertForm[] = unique.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/[ '&]+/g, "-"),
  }));
  const brands = await db.insert(BrandTable).values(form).returning();

  const brandMap = new Map<string, IBrand>();
  brands.forEach((brand) => brandMap.set(brand.name, brand));
  return brandMap;
}

async function insertCategories(db: Database, categoryPaths: string[][]) {
  console.log("Seeding categories");

  const categoryMap = new Map<string, ICategory>();
  const insertForm: ICategoryInsertForm[] = [];

  for (const names of categoryPaths) {
    let parentId: string | null = null;
    let path = "";

    for (let level = 0; level < names.length; level++) {
      const name = names[level];
      path = path ? `${path}>${name}` : name;

      if (!categoryMap.has(path)) {
        const form = {
          id: randomUUID(),
          level,
          name,
          parentId,
          path,
          slug: name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        };
        insertForm.push(form);
        categoryMap.set(path, form);
      }
      parentId = categoryMap.get(path)!.id;
    }
  }

  const levels = [...new Set(insertForm.map((x) => x.level))].sort();
  for (const level of levels) {
    const rows = insertForm.filter((x) => x.level === level);
    await db.insert(CategoryTable).values(rows);
  }

  return categoryMap;
}

async function insertUsers(db: Database) {
  console.log("insert users");

  const insertForms = Array.from({ length: 10 }).map(() => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    roles: [USER_ROLE.ADMIN],
  }));
  const users = await db
    .insert(schema.UserTable)
    .values(insertForms)
    .returning();
  await Promise.all(
    users.map(async (user) => {
      await db.insert(schema.WalletTable).values({
        tokens: faker.number.int({ min: 100, max: 1000 }),
        userId: user.id,
      });
    }),
  );
  return users;
}

async function insertShops(db: Database, users: IUser[]) {
  console.log("inserting shops with a all product shop owner");
  const insertForms: IShopInsertForm[] = users.flatMap((user) => {
    return {
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
    };
  });
  return await db.insert(schema.ShopTable).values(insertForms).returning();
}

async function insertProductsAndOffers(
  db: Database,
  users: IUser[],
  shops: IShop[],
) {
  console.log("Seeding products");

  // One user/shop owns every product; all other shops just make offers on them.
  const owner = faker.helpers.arrayElement(users);
  const ownerShop = shops.find((shop) => shop.userId === owner.id)!;
  const otherShops = shops.filter((shop) => shop.id !== ownerShop.id);

  const records = await readProductsCsv(CSV_PATH);

  const [brandMap, categoryMap] = await Promise.all([
    insertBrands(
      db,
      records.map((r) => r.brand),
    ),
    insertCategories(
      db,
      records.map((r) => JSON.parse(r.categories) as string[]),
    ),
  ]);

  const productsInsertForm: IProductInsertForm[] = [];
  const productOffersForm: IProductOfferInsertForm[] = [];
  const productImagesForm: ProductImageInsertForm[] = [];

  for (const record of records) {
    const categories = JSON.parse(record.categories) as string[];
    const deepestCategory = categoryMap.get(categories.join(">"))!;

    const productId = crypto.randomUUID();
    const initialPrice = parseFloat(record.initial_price) || 10;
    const finalPrice = parseFloat(record.final_price) || initialPrice;
    const lowPrice = Math.min(initialPrice, finalPrice);
    const highPrice = Math.max(initialPrice, finalPrice);

    productsInsertForm.push({
      id: productId,
      shopId: ownerShop.id,
      description: record.description,
      title: record.title,
      specifications: record.specifications
        ? (JSON.parse(record.specifications) as Spec[])
        : ([] as Spec[]),
      categoryId: deepestCategory.id,
      brandId: brandMap.get(record.brand)!.id,
      asin: record.asin,
      modelNumber: record.model_number,
      upc: record.upc,
      status: "public",
      initialPrice,
    });
    productImagesForm.push({
      isThumbnail: true,
      productId: productId,
      url: faker.internet.url(),
    });

    // owner shop always offers the product; a handful of other shops offer it too.
    const numOtherOffers = faker.number.int({
      min: 1,
      max: Math.min(5, otherShops.length),
    });
    const selectedShops = faker.helpers
      .shuffle(otherShops)
      .slice(0, numOtherOffers);

    const offerShops = [ownerShop, ...selectedShops];
    const offers = offerShops.map((shop) => ({
      shop,
      finalPrice: faker.number.float({
        min: lowPrice,
        max: highPrice,
        fractionDigits: 2,
      }),
    }));
    const lowestOffer = offers.reduce((min, offer) =>
      offer.finalPrice < min.finalPrice ? offer : min,
    );
    offers.forEach((offer) => {
      productOffersForm.push({
        productId,
        shopId: offer.shop.id,
        finalPrice: offer.finalPrice,
        title: record.title,
        pageUrl: faker.internet.url(),
        status: "active",
        byboxWinner: offer.shop.id === lowestOffer.shop.id,
      });
    });
  }

  await db.insert(schema.ProductTable).values(productsInsertForm);
  await db.insert(schema.ProductOfferTable).values(productOffersForm);
  await db.insert(schema.ProductImageTable).values(productImagesForm);
}

async function seedFrTokenPlans(db: Database) {
  await db.insert(schema.FrTokenPlanTable).values(FrTokenPlanDatasets);
}

main();
