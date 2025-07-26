import { Injectable } from "@nestjs/common";
import { IPaymentConfig, PaymentConfig } from "src/config/payment.config";
import ZarinPal from "zarinpal-node-sdk";
import { ZarinPalPaymentRequest, ZarinPalVerifyPayment } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { IBasePaymentProvider } from "../interfaces/services/IBasePayment";

@Injectable()
export class ZarinpalPaymentService
  implements IBasePaymentProvider<"zarinpal">
{
  private zarinpal: ZarinPal;

  constructor(@PaymentConfig() private config: IPaymentConfig) {
    this.zarinpal = new ZarinPal({
      merchantId: this.config.zarinpal.merchantId,
      sandbox: this.config.zarinpal.sandbox,
    });
  }

  async createPayment(
    userEmail: string,
    amount: number,
  ): Promise<{ referenceId: string; url: string }> {
    try {
      const result = (await this.zarinpal.payments.create({
        amount: amount * 10,
        callback_url: this.config.zarinpal.callbackUrl!,
        description: "TODO: write description",
        email: userEmail,
      })) as ZarinPalPaymentRequest;

      const url = this.zarinpal.payments.getRedirectUrl(result.data.authority);
      return {
        referenceId: result.data.authority,
        url,
      };
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ZarinpalReqFailed, error);
    }
  }

  async verifyPayment(payload: {
    referenceId: string;
    amount: number;
  }): Promise<{ transactionId: string }> {
    let result: ZarinPalVerifyPayment;
    try {
      // eslint-disable-next-line
      result = await this.zarinpal.verifications.verify({
        amount: payload.amount * 10,
        authority: payload.referenceId,
      });
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ZarinpalReqFailed, error);
    }

    if (result.data.code !== 100) {
      throw new KalamcheError(KalamcheErrorType.PaymentVerificationFailed);
    }

    return { transactionId: result.data.ref_id.toString() };
  }
}
