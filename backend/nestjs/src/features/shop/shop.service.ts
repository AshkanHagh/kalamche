import { Injectable } from "@nestjs/common";
import { IShopService } from "./interfaces/service";
import { IShop } from "src/drizzle/types";
import { RepositoryService } from "src/repository/repository.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class ShopService implements IShopService {
  constructor(private repo: RepositoryService) {}

  async createShop(userId: string): Promise<IShop> {
    const hasShop = await this.repo.shop().findByUserId(userId);
    if (hasShop) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }

    const shop = await this.repo.shop().insert({ userId });
    return shop;
  }
}
