import { faker } from "@faker-js/faker/.";
import { TestingModule } from "@nestjs/testing";
import { randomUUID } from "node:crypto";
import { FrTokenPlanDatasets } from "src/assets/datasets/fr-token-plans";
import { DATABASE } from "src/drizzle/constants";
import {
  FrTokenPlanTable,
  IFrTokenPlan,
  IUser,
  TransactionTable,
  UserTable,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { FrTokenService } from "src/features/fr-token/fr-token.service";
import { ZarinpalPaymentService } from "src/features/fr-token/util-services/zarinpal-payment.service";
import {
  createNestAppInstance,
  createUser,
  truncateTables,
} from "test/test.helper";

describe("FrTokenService", () => {
  let nestModule: TestingModule;
  let frTokenService: FrTokenService;
  let db: Database;
  let zarinpalService: ZarinpalPaymentService;

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    frTokenService = nestModule.get(FrTokenService);
    db = nestModule.get(DATABASE);
    zarinpalService = nestModule.get(ZarinpalPaymentService);
  });

  beforeEach(async () => {
    await truncateTables(db, UserTable, FrTokenPlanTable, TransactionTable);
  });

  describe(".createCheckout", () => {
    let user: IUser;
    let plans: IFrTokenPlan[];

    beforeEach(async () => {
      user = await createUser(db, {});
      plans = await db
        .insert(FrTokenPlanTable)
        .values(FrTokenPlanDatasets)
        .returning();
    });

    it("should create a zarinpal checkout", async () => {
      const createPaymentSpy = jest
        .spyOn(zarinpalService, "createPayment")
        .mockResolvedValue({
          referenceId: randomUUID(),
          url: faker.internet.url(),
        });

      await expect(
        frTokenService.createCheckout(user, {
          paymentMethod: "zarinpal",
          planId: plans[0].id,
        }),
      ).resolves.toBeDefined();

      createPaymentSpy.mockRestore();
    });
  });

  afterAll(async () => {
    await db.$client?.end();
    await nestModule.close();
  });
});
