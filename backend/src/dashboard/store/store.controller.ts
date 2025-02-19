import { Body, Controller, Post, Req } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/utils/zod-validation.pipe";
import { CreateStoreDto, createStoreDto } from "./dto/create-store";
import { StoreService } from "./store.service";
import { CustomeRequest } from "../types/req";

@Controller("store")
export class StoreController {
  constructor(private readonly service: StoreService) {}

  @Post("/")
  createStore(
    @Req() req: CustomeRequest,
    @Body(new ZodValidationPipe(createStoreDto)) body: CreateStoreDto,
  ) {
    return this.service.insertStore(req.userId!, body);
  }
}
