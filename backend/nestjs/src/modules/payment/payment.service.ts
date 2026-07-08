import { Inject, Injectable } from "@nestjs/common";
import { Database } from "src/drizzle/types";
import {
  FrTokenPlanTable,
  IUser,
  TransactionTable,
  WalletTable,
} from "src/drizzle/schemas";
import { CreateCheckoutDto, VerifyPaymentDto } from "./dtos";
import { ZarinpalPaymentService } from "./services/zarinpal-payment.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { DATABASE } from "src/drizzle/constants";
import { and, eq, inArray, sql } from "drizzle-orm";

@Injectable()
export class PaymentService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private zarinpalProvider: ZarinpalPaymentService,
  ) {}

  private getProvider(paymentMethod: CreateCheckoutDto["provider"]) {
    switch (paymentMethod) {
      case "zarinpal": {
        return this.zarinpalProvider;
      }
      default: {
        throw new KalamcheError(KalamcheErrorType.InvalidPaymentMethod);
      }
    }
  }

  async createCheckout(user: IUser, payload: CreateCheckoutDto) {
    const plan = await this.db.query.FrTokenPlanTable.findFirst({
      where: eq(FrTokenPlanTable.id, payload.planId),
    });
    if (!plan) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    const provider = this.getProvider(payload.provider);
    const checkout = await provider.createPayment(user.email, plan.totalPrice);

    await this.db.insert(TransactionTable).values({
      // transaction id will be updated later to real transaction id
      // this is only for payment verification
      transactionId: checkout.referenceId,
      price: plan.totalPrice,
      tokens: plan.tokens,
      userId: user.id,
      status: "pending",
      method: payload.provider,
    });

    return {
      url: checkout.url,
    };
  }

  async verifyPayment(userId: string, payload: VerifyPaymentDto) {
    const provider = this.getProvider(payload.paymentMethod);

    const pendingTrx = await this.db.query.TransactionTable.findFirst({
      where: and(
        eq(TransactionTable.transactionId, payload.referenceId),
        inArray(TransactionTable.status, ["pending", "failed"]),
      ),
    });
    if (!pendingTrx) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
    if (pendingTrx.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PaymentVerificationFailed);
    }

    let transactionId: string;
    try {
      transactionId = await provider.verifyPayment({
        amount: pendingTrx.price,
        authority: payload.referenceId,
      });
    } catch (error) {
      await this.db
        .update(TransactionTable)
        .set({ status: "failed" })
        .where(eq(TransactionTable.id, pendingTrx.id));
      throw new KalamcheError(
        KalamcheErrorType.PaymentVerificationFailed,
        error,
      );
    }

    return await this.db.transaction(async (tx) => {
      const [transaction] = await this.db
        .update(TransactionTable)
        .set({
          status: "completed",
          transactionId: transactionId,
        })
        .where(eq(TransactionTable.id, pendingTrx.id))
        .returning();
      await tx
        .update(WalletTable)
        .set({
          tokens: sql`${WalletTable.tokens} + ${transaction.tokens}`,
        })
        .where(eq(WalletTable.userId, userId));
      return transaction;
    });
  }
}
