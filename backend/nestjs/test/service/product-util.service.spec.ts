import { TestingModule } from "@nestjs/testing";
import { DATABASE } from "src/drizzle/constants";
import {
  ProductImageTable,
  ProductTable,
  ShopTable,
  TempProductTable,
  UserTable,
} from "src/drizzle/schemas";
import { Database, IUser } from "src/drizzle/types";
import { ProductUtilService } from "src/features/product/util.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import {
  createNestAppInstance,
  createShop,
  createUser,
  truncateTables,
} from "test/test.helper";

describe("ProductUtilService", () => {
  let nestModule: TestingModule;
  let productUtilService: ProductUtilService;
  let db: Database;

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    productUtilService = nestModule.get(ProductUtilService);
    db = nestModule.get(DATABASE);
  });

  beforeEach(async () => {
    await truncateTables(
      db,
      UserTable,
      ProductTable,
      ShopTable,
      ProductImageTable,
      TempProductTable,
    );
  });

  describe(".userHasPermission", () => {
    let user: IUser;

    beforeEach(async () => {
      user = await createUser(db, {});
    });

    it("resolves without error when shop is valid and no productId is provided", async () => {
      const shop = await createShop(db, {
        userId: user.id,
      });

      await expect(
        productUtilService.userHasPermission(user.id, shop.id),
      ).resolves.toBeUndefined();
    });

    it("should throws PermissionDenied when user dose not own the shop", async () => {
      const anotherUser = await createUser(db, {});
      const shop = await createShop(db, {
        userId: anotherUser.id,
      });

      await expect(
        productUtilService.userHasPermission(user.id, shop.id),
      ).rejects.toThrow(new KalamcheError(KalamcheErrorType.PermissionDenied));
    });

    it("should throws PermissionDenied when shop is not verified", async () => {
      const shop = await createShop(db, {
        userId: user.id,
        status: "pending",
      });

      await expect(
        productUtilService.userHasPermission(user.id, shop.id),
      ).rejects.toThrow(new KalamcheError(KalamcheErrorType.PermissionDenied));
    });
  });

  afterAll(async () => {
    await db.$client?.end();
    await nestModule.close();
  });
});
