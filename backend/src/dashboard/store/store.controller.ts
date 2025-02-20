import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodValidationPipe } from "src/common/utils/zod-validation.pipe";
import { CreateStoreDto, createStoreDto } from "./dto/create-store";
import { StoreService } from "./store.service";
import { CustomeRequest } from "../types/req";
import { UpdateStoreDto, updateStoreDto } from "./dto/update-store";
import { AuthorizationGuard } from "../guards/authorization";
import { HttpStatusCode } from "axios";

@Controller("store")
export class StoreController {
  constructor(private readonly service: StoreService) {}

  @Post("/")
  @UseGuards(AuthorizationGuard)
  @HttpCode(HttpStatusCode.Created)
  public async createStore(
    @Req() req: CustomeRequest,
    @Body(new ZodValidationPipe(createStoreDto)) body: CreateStoreDto,
  ) {
    const store = await this.service.insertStore(req.userId!, body);
    return {
      success: true,
      store,
    };
  }

  @Get("/:storeId")
  @HttpCode(HttpStatusCode.Ok)
  public async getStore(
    @Param("storeId", new ParseUUIDPipe()) storeId: string,
  ) {
    const store = await this.service.findById(storeId);
    return {
      success: true,
      store,
    };
  }

  @Patch("/:storeId")
  @UseGuards(AuthorizationGuard)
  @HttpCode(HttpStatusCode.Ok)
  public async updateStore(
    @Req() req: CustomeRequest,
    @Param("storeId", new ParseUUIDPipe()) storeId: string,
    @Body(new ZodValidationPipe(updateStoreDto)) storeDto: UpdateStoreDto,
  ) {
    const store = await this.service.updateStore(
      storeId,
      req.userId!,
      storeDto,
    );

    return {
      success: true,
      store,
    };
  }

  @Delete("/:storeId")
  @UseGuards(AuthorizationGuard)
  @HttpCode(HttpStatusCode.NoContent)
  public async deleteStore(
    @Req() req: CustomeRequest,
    @Param("storeId", new ParseUUIDPipe()) storeId: string,
  ) {
    await this.service.deleteStore(req.userId!, storeId);
  }
}
