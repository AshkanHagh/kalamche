import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UsePipes,
} from "@nestjs/common";
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

  @Get("/:storeId")
  @UsePipes(ParseUUIDPipe)
  async getStore(@Param("storeId") storeId: string) {
    return await this.service.findById(storeId);
  }
}
