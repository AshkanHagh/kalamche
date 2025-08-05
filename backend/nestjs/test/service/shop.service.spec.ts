import { faker } from "@faker-js/faker/.";
import { TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { USER_ROLE } from "src/constants/global.constant";
import { DATABASE } from "src/drizzle/constants";
import { ShopTable, TempShopTable, UserTable } from "src/drizzle/schemas";
import { Database, IUser } from "src/drizzle/types";
import { S3Service } from "src/features/product/services/s3.service";
import { ShopService } from "src/features/shop/shop.service";
import { TempShopRepository } from "src/repository/repositories/temp-shop.repository";
import { createNestAppInstance, truncateTables } from "test/test.helper";

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
      const [newUser] = await db
        .insert(UserTable)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          roles: [USER_ROLE.USER],
        })
        .returning();

      user = newUser;
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
      // create a random user
      const [newUser] = await db
        .insert(UserTable)
        .values({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          roles: [USER_ROLE.USER],
        })
        .returning();

      user = newUser;
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
      // create a complete shop
      const [shop] = await db
        .insert(ShopTable)
        .values({
          userId: user.id,
          email: faker.internet.email(),
          name: faker.company.name(),
          phone: faker.phone.number(),
          website: faker.internet.url(),
          country: faker.location.country(),
          description: faker.lorem.paragraph(),
          state: faker.location.state(),
          streetAddress: faker.location.streetAddress(),
          zipCode: faker.location.zipCode(),
          imageUrl: faker.image.avatar(),
          status: "verified",
          city: faker.location.city(),
        })
        .returning();

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
