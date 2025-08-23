import { faker } from "@faker-js/faker/.";
import { TestingModule } from "@nestjs/testing";
import { DATABASE } from "src/drizzle/constants";
import {
  BrandTable,
  CategoryTable,
  IShop,
  IUser,
  ProductTable,
  TempProductTable,
  UserTable,
  WalletTable,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { ProductService } from "src/features/product/product.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import {
  createNestAppInstance,
  createShop,
  createUser,
  truncateTables,
} from "test/test.helper";

describe("ProductService", () => {
  let nestModule: TestingModule;
  let productService: ProductService;
  let db: Database;

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    productService = nestModule.get(ProductService);
    db = nestModule.get(DATABASE);
  });

  beforeEach(async () => {
    await truncateTables(
      db,
      UserTable,
      ProductTable,
      TempProductTable,
      CategoryTable,
      BrandTable,
    );
  });

  describe(".createProduct", () => {
    let user: IUser;
    let shop: IShop;

    beforeEach(async () => {
      user = await createUser(db, {});
      shop = await createShop(db, {
        userId: user.id,
      });
    });

    it("should create a temp product", async () => {
      // Add a fake token amount to the user's wallet to pass product creation checks
      await db.insert(WalletTable).values({
        tokens: 50,
        userId: user.id,
      });

      const productUpc = faker.commerce.isbn({ variant: 10 });
      const result = await productService.createProduct(user.id, shop.id, {
        upc: productUpc,
      });

      expect(result.upc).toBe(productUpc);
      expect(result.shopId).toBe(shop.id);
    });

    it("should throws NotEnoughTokens if the wallet doesn't have enough tokens", async () => {
      await db.insert(WalletTable).values({
        tokens: 0,
        userId: user.id,
      });

      await expect(
        productService.createProduct(user.id, shop.id, {
          upc: faker.commerce.isbn({ variant: 10 }),
        }),
      ).rejects.toThrow(new KalamcheError(KalamcheErrorType.NotEnoughTokens));
    });
  });

  afterAll(async () => {
    await db.$client?.end();
    await nestModule.close();
  });
});
