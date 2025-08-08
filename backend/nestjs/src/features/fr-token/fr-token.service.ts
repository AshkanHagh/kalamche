import { Inject, Injectable } from "@nestjs/common";
import { IFrTokenService } from "./interfaces/IService";
import { CreateCheckoutDto, VerifyPaymentPayload } from "./dto";
import { FrTokenPlanRepository } from "src/repository/repositories/fr-token-plan.repository";
import { PAYMENT_METHODS } from "./constants";
import { ZarinpalPaymentService } from "./util-services/zarinpal-payment.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { Database, IUser } from "src/drizzle/types";
import { TransactionRepository } from "src/repository/repositories/transaction.repository";
import { ITransactionRecord } from "src/drizzle/schemas";
import { DATABASE } from "src/drizzle/constants";
import { WalletRepository } from "src/repository/repositories/wallet.repository";

@Injectable()
export class FrTokenService implements IFrTokenService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private frTokenPlanRepository: FrTokenPlanRepository,
    private transactionRepository: TransactionRepository,
    private walletRepository: WalletRepository,
    private zarinpalService: ZarinpalPaymentService,
  ) {}

  async createCheckout(
    user: IUser,
    params: CreateCheckoutDto,
  ): Promise<string> {
    const plan = await this.frTokenPlanRepository.findById(params.planId);

    const provider = this.getProvider(params.paymentMethod);
    const result = await provider.createPayment(user.email, plan.totalPrice);

    await this.transactionRepository.insert({
      referenceId: result.referenceId,
      price: plan.totalPrice,
      tokens: plan.tokens,
      userId: user.id,
      status: "pending",
      method: params.paymentMethod,
    });

    return result.url;
  }

  async verifyPayment(
    userId: string,
    payload: VerifyPaymentPayload,
  ): Promise<ITransactionRecord> {
    const provider = this.getProvider(payload.paymentMethod);

    if (payload.status && payload.status !== "OK") {
      throw new KalamcheError(KalamcheErrorType.PaymentVerificationFailed);
    }

    const pendingTransaction =
      await this.transactionRepository.findByReferenceId(payload.referenceId);
    if (
      pendingTransaction.status === "completed" ||
      pendingTransaction.status === "failed"
    ) {
      throw new KalamcheError(KalamcheErrorType.PaymentVerificationFailed);
    }
    if (pendingTransaction.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    let result: { transactionId: string };
    try {
      result = await provider.verifyPayment({
        amount: pendingTransaction.price,
        referenceId: payload.referenceId,
      });
    } catch (error) {
      await this.transactionRepository.update(this.db, pendingTransaction.id, {
        status: "failed",
        error: error as string,
      });
      throw error;
    }

    return await this.db.transaction(async (tx) => {
      const transaction = await this.transactionRepository.update(
        tx,
        pendingTransaction.id,
        {
          status: "completed",
          referenceId: null,
          transactionId: result.transactionId,
        },
      );
      await this.walletRepository.updateWalletTokens(
        tx,
        userId,
        transaction.tokens,
      );
      return transaction;
    });
  }

  private getProvider(paymentMethod: (typeof PAYMENT_METHODS)[number]) {
    switch (paymentMethod) {
      case "stripe": {
        throw new Error("not implemented");
      }
      case "zarinpal": {
        return this.zarinpalService;
      }
      default: {
        throw new KalamcheError(KalamcheErrorType.InvalidPaymentMethod);
      }
    }
  }
}
