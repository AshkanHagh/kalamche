import { Inject, Injectable } from "@nestjs/common";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { Request } from "express";
import {
  ProductOfferTable,
  ShopTable,
  ShopViewTable,
  WalletTable,
} from "src/drizzle/schemas";
import { and, gte, sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { REDIRECT_TOKEN_CHARGE_COUNT } from "./constants";

@Injectable()
export class FrTokenService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async getPlans() {
    return await this.db.query.FrTokenPlanTable.findMany();
  }

  generateRedirectUrl(offerId: string) {
    return `${process.env.OFFER_REDIRECT_PAGE_URL}/${offerId}`;
  }

  async redirectToOfferPage(req: Request, offerId: string) {
    const userAgent = req.headers["user-agent"] as string;
    let ip = req.headers["x-forwarded-for"] as string | undefined;
    if (ip) {
      ip = ip.split(",")[0].trim();
    } else {
      ip = req.connection?.remoteAddress || req.socket?.remoteAddress || "";
    }

    return await this.db.transaction(async (tx) => {
      const [offer] = await tx
        .select()
        .from(ProductOfferTable)
        .where(
          and(
            eq(ProductOfferTable.id, offerId),
            eq(ProductOfferTable.status, "active"),
          ),
        )
        .for("update");
      if (!offer) {
        throw new KalamcheError(KalamcheErrorType.FailedToRedirect);
      }

      const redirectUrl = `${offer.pageUrl}?utm_source=kalamche&utm_medium=offer`;
      // check user has required amount of tokens to continue
      const shop = await tx.query.ShopTable.findFirst({
        where: eq(ShopTable.id, offer.shopId),
        columns: {},
        with: {
          user: {
            columns: { id: true },
          },
        },
      });
      const [userWallet] = await tx
        .select()
        .from(WalletTable)
        .where(
          and(
            eq(WalletTable.userId, shop!.user.id),
            gte(WalletTable.tokens, REDIRECT_TOKEN_CHARGE_COUNT),
          ),
        )
        .for("update");
      if (!userWallet) {
        await tx.update(ProductOfferTable).set({ status: "inactive" });
        throw new KalamcheError(KalamcheErrorType.FailedToRedirect);
      }

      // if user already visited this website in the past 6h, consume token
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const [lastUserView] = await tx
        .select()
        .from(ShopViewTable)
        .where(
          and(
            eq(ShopViewTable.shopId, offer.shopId),
            eq(ShopViewTable.productId, offer.productId),
            eq(ShopViewTable.ip, ip),
            eq(ShopViewTable.userAgent, userAgent),
            gte(ShopViewTable.createdAt, sixHoursAgo),
          ),
        );
      if (!lastUserView) {
        await Promise.all([
          tx
            .update(WalletTable)
            .set({
              tokens: sql`${WalletTable.tokens} - ${REDIRECT_TOKEN_CHARGE_COUNT}`,
            })
            .where(eq(WalletTable.id, userWallet.id)),
          tx.insert(ShopViewTable).values({
            ip,
            userAgent,
            productId: offer.productId,
            shopId: offer.shopId,
            tokenCharged: REDIRECT_TOKEN_CHARGE_COUNT,
          }),
        ]);
      }

      return redirectUrl;
    });
  }
}
