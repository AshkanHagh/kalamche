export const DATABASE: string = "DATABASE";

export enum USER_ROLE {
  ADMIN = "admin",
  USER = "user",
  SELLER = "seller",
  PENDING_SELLER = "pending_seller",
}

export const PAYMENT_METHODS = ["zarinpal", "stripe"] as const;
