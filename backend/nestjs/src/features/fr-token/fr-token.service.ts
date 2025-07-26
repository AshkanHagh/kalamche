import { Injectable } from "@nestjs/common";
import { IFrTokenService } from "./interfaces/IService";
import { CreateCheckoutDto } from "./dto";
import { FrTokenPlanRepository } from "src/repository/repositories/fr-token-plan.repository";
import { PAYMENT_METHODS } from "./constants";
import { ZarinpalPaymentService } from "./util-services/zarinpal-payment.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { IUser } from "src/drizzle/types";
import { TransactionRepository } from "src/repository/repositories/transaction.repository";

@Injectable()
export class FrTokenService implements IFrTokenService {
  constructor(
    private frTokenPlanRepository: FrTokenPlanRepository,
    private transactionRepository: TransactionRepository,
    private zarinpalService: ZarinpalPaymentService,
  ) {}

  async createCheckout(
    user: IUser,
    payload: CreateCheckoutDto,
  ): Promise<string> {
    const plan = await this.frTokenPlanRepository.findById(payload.planId);

    const provider = this.#getProvider(payload.paymentMethod);
    const result = await provider.createPayment(user.email, plan.totalPrice);

    await this.transactionRepository.insert({
      authority: result.transactionId,
      price: plan.totalPrice,
      tokens: plan.tokens,
      userId: user.id,
      status: "pending",
    });

    return result.url;
  }

  #getProvider(paymentMethod: (typeof PAYMENT_METHODS)[number]) {
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
