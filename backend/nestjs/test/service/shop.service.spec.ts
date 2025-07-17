import { TestingModule } from "@nestjs/testing";
import { StartedMinioContainer } from "@testcontainers/minio";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { DATABASE } from "src/drizzle/constants";
import { migration } from "src/drizzle/migration";
import { Database, IShop, IUser } from "src/drizzle/types";
import { ShopService } from "src/features/shop/shop.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { RepositoryService } from "src/repository/repository.service";
import {
  clearDb,
  createNestAppInstance,
  createTestMinio,
  createTestPostgresDb,
  createUser,
  stopDb,
} from "test/test.helper";
import { faker } from "@faker-js/faker";
import { USER_ROLE } from "src/constants/global.constant";

describe("ShopService", () => {
  let nestModule: TestingModule;
  let service: ShopService;
  let pgContainer: StartedPostgreSqlContainer;
  let minioContainer: StartedMinioContainer;
  let db: Database;
  let repo: RepositoryService;

  beforeEach(async () => {
    await clearDb();
  });

  beforeAll(async () => {
    [pgContainer, minioContainer] = await Promise.all([
      createTestPostgresDb(),
      createTestMinio(),
    ]);
    await migration();

    nestModule = await createNestAppInstance();
    service = nestModule.get(ShopService);
    db = nestModule.get(DATABASE);
    repo = nestModule.get(RepositoryService);
  }, 1000 * 15);

  describe(".createShop", () => {
    let user: IUser;
    let result: IShop;

    beforeEach(async () => {
      user = await createUser(nestModule);
      result = await service.createShop(user.id);
    });

    it("should not create a shop for a user that already has one", async () => {
      const shop = service.createShop(user.id);
      await expect(shop).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.ShopAlreadyExists),
      );
    });

    it("should create a temp shop", async () => {
      expect(result.isTemp).toBe(true);

      const shop = repo.shop().findById(result.id);
      await expect(shop).resolves.toEqual(result);
    });
  });

  describe(".updateShopCreation", () => {
    const payload = {
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      city: faker.location.city(),
      country: faker.location.country(),
      state: faker.location.state(),
      description: faker.lorem.paragraph(),
      streetAddress: faker.location.streetAddress(),
      website: faker.internet.url(),
      zipCode: faker.location.zipCode(),
    };
    let result: IShop;
    let user: IUser;

    beforeEach(async () => {
      user = await createUser(nestModule);

      const shop = await service.createShop(user.id);
      result = await service.updateShopCreation(user, shop.id, payload);
    });

    it("should update and complete the shop creation", async () => {
      expect(result.isTemp).toBe(false);

      const shop = repo.shop().findById(result.id);
      await expect(shop).resolves.toEqual(result);

      const user2 = await repo.user().findById(user.id);
      expect(user2?.roles).toEqual([USER_ROLE.USER, USER_ROLE.SELLER]);
    });

    it("should not update the shop creation", async () => {
      const result2 = service.updateShopCreation(user, result.id, payload);
      await expect(result2).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.ShopAlreadyExists),
      );

      const newUser = await createUser(nestModule);
      const result4 = service.updateShopCreation(newUser, result.id, payload);
      await expect(result4).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.PermissionDenied),
      );
    });
  });

  afterAll(async () => {
    await nestModule.close();
    await stopDb(db);
    await Promise.all([pgContainer.stop(), minioContainer.stop()]);
  }, 1000 * 15);
});
