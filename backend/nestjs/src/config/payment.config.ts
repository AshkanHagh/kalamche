import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const paymentConfig = registerAs("payment", () => {
  return {
    zarinpal: {
      merchantId: process.env.ZARINPAL_MERCHANT_ID,
      callbackUrl: process.env.ZARINPAL_CALLBACK_URL,
      sandbox: JSON.parse(process.env.ZARINPAL_SANDBOX || "true") as boolean,
    },
  };
});

export const PaymentConfig = () => Inject(paymentConfig.KEY);
export type IPaymentConfig = ConfigType<typeof paymentConfig>;
