import { Injectable } from "@nestjs/common";
import { IPaymentConfig, PaymentConfig } from "src/config/payment.config";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { BasePaymentProvider } from "../interfaces/base-payment";
import { createWithOptions, ZarinPalCheckout } from "zarinpal-checkout";

type VerifyPaymentPayload = {
  authority: string;
  amount: number;
};

@Injectable()
export class ZarinpalPaymentService implements BasePaymentProvider {
  private zarinpal: ZarinPalCheckout;

  constructor(@PaymentConfig() private config: IPaymentConfig) {
    this.zarinpal = createWithOptions(config.zarinpal.merchantId!, {
      sandbox: config.zarinpal.sandbox,
      currency: "IRT",
    });
  }

  async createPayment(userEmail: string, amount: number) {
    try {
      const checkout = await this.zarinpal.PaymentRequest({
        Amount: amount,
        CallbackURL: this.config.zarinpal.callbackUrl!,
        Description: "TODO: write description",
        Email: userEmail,
      });
      return {
        referenceId: checkout.authority,
        url: checkout.url,
      };
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ZarinpalReqFailed, error);
    }
  }

  async verifyPayment(payload: VerifyPaymentPayload) {
    try {
      const verification = await this.zarinpal.PaymentVerification({
        Amount: payload.amount,
        Authority: payload.authority,
      });
      return String(verification.refId);
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ZarinpalReqFailed, error);
    }
  }
}
