import { faker } from "@faker-js/faker/.";
import { TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { DATABASE, USER_ROLE } from "src/drizzle/constants";
import {
  IUser,
  ShopTable,
  TempShopTable,
  UserTable,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { S3Service } from "src/features/product/services/s3.service";
import { ShopService } from "src/features/shop/shop.service";
import { TempShopRepository } from "src/repository/repositories/temp-shop.repository";
import {
  createNestAppInstance,
  createShop,
  createUser,
  truncateTables,
} from "test/test.helper";

describe("ShopService", () => {
  let nestModule: TestingModule;
  let shopService: ShopService;
  let db: Database;
  let tempShopRepository: TempShopRepository;
  let s3Service: S3Service;

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    shopService = nestModule.get(ShopService);
    db = nestModule.get(DATABASE);
    tempShopRepository = nestModule.get(TempShopRepository);
    s3Service = nestModule.get(S3Service);
  });

  beforeEach(async () => {
    await truncateTables(db, UserTable, ShopTable, TempShopTable);
  });

  describe(".createShop", () => {
    let user: IUser;

    beforeEach(async () => {
      user = await createUser(db, {});
    });

    it("should create a temp shop", async () => {
      const result = await shopService.createShop(user.id);
      expect(result).toBeDefined();

      // Create temp shop adds a temporary seller role to the user for shop creation
      const [currentUser] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.id, user.id));
      expect(currentUser.roles).toContain(USER_ROLE.PENDING_SELLER);
    });

    it("should rollback database transaction on any failure", async () => {
      const spyTempShopRepo = jest
        .spyOn(tempShopRepository, "insert")
        .mockRejectedValue(new Error("failed to insert shop"));

      await expect(shopService.createShop(user.id)).rejects.toThrow();
      // making sure that error comes from insert method
      expect(spyTempShopRepo).toHaveBeenCalled();

      const [currentUser] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.id, user.id));
      expect(currentUser.roles).not.toContain(USER_ROLE.PENDING_SELLER);

      spyTempShopRepo.mockRestore();
    });
  });

  describe(".uploadImage", () => {
    let user: IUser;
    let imageBuffer: Buffer;

    beforeAll(async () => {
      // download a fake image and get image buffer
      const result = await fetch(faker.image.avatar());
      imageBuffer = Buffer.from(await result.arrayBuffer());
    });

    beforeEach(async () => {
      user = await createUser(db, {});
    });

    it("should upload a new image for pending shop", async () => {
      const tempShop = await shopService.createShop(user.id);
      await shopService.uploadImage(
        user.id,
        {
          isTempShop: true,
          shopId: tempShop.id,
        },
        imageBuffer,
      );

      const [updatedTempShop] = await db
        .select()
        .from(TempShopTable)
        .where(eq(TempShopTable.id, tempShop.id));
      expect(updatedTempShop.imageUrl).not.toBe(tempShop.imageUrl);
    });

    it("should upload/update a new image for shop", async () => {
      const shop = await createShop(db, {
        userId: user.id,
      });

      await shopService.uploadImage(
        user.id,
        {
          isTempShop: false,
          shopId: shop.id,
        },
        imageBuffer,
      );

      const [updatedShop] = await db
        .select()
        .from(ShopTable)
        .where(eq(ShopTable.id, shop.id));

      expect(updatedShop.imageUrl).not.toBe(shop.imageUrl);
    });

    it("should rollback database transaction on any failure", async () => {
      const s3ServiceSpy = jest
        .spyOn(s3Service, "delete")
        .mockRejectedValue(new Error("failed to update shop"));

      // Create a temporary shop for the user
      const tempShop = await shopService.createShop(user.id);
      // Set a placeholder image URL for the new temp shop to allow image upload and replace old image
      const imageUrl = faker.image.avatar();
      await db
        .update(TempShopTable)
        .set({ imageUrl })
        .where(eq(TempShopTable.id, tempShop.id))
        .execute();

      await expect(
        shopService.uploadImage(
          user.id,
          {
            isTempShop: true,
            shopId: tempShop.id,
          },
          imageBuffer,
        ),
      ).rejects.toThrow();
      // making sure that error comes from insert method
      expect(s3ServiceSpy).toHaveBeenCalled();

      const [updatedTempShop] = await db
        .select()
        .from(TempShopTable)
        .where(eq(TempShopTable.id, tempShop.id));

      // Verify that the image URL has been rolled back to the original
      expect(updatedTempShop.imageUrl).toBe(imageUrl);

      s3ServiceSpy.mockRestore();
    });
  });

  afterAll(async () => {
    await db.$client?.end();
    await nestModule.close();
  });
});
