import { PAYMENT_METHODS } from "../constants";

export type VerifyPaymentParams<T extends (typeof PAYMENT_METHODS)[number]> =
  T extends "zarinpal"
    ? {
        referenceId: string;
        amount: number;
      }
    : {
        referenceId: string;
      };

// zarinpal sdk missing types
export type ZarinPalPaymentRequest = {
  data: {
    authority: string;
    fee: number;
    fee_type: string;
    code: number;
    message: string;
  };
  errors: [];
};

// zarinpal sdk missing types
export type ZarinPalVerifyPayment = {
  data: {
    wages: unknown;
    code: number;
    message: string;
    card_hash: string;
    card_pan: string;
    ref_id: number;
    fee_type: string;
    fee: number;
    shaparak_fee: number;
    order_id: string | null;
  };
  errors: [];
};
