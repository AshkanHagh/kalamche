import { Injectable } from "@nestjs/common";
import {
  AppConfig,
  AuthOptions,
  RuntimeAppConfig,
  SystemOptions,
} from "./app.config";
import { defaultConfig } from "./default.config";

@Injectable()
export class ConfigService implements AppConfig {
  private activeConfig: RuntimeAppConfig;

  constructor() {
    this.activeConfig = defaultConfig;
  }

  get authOptions(): AuthOptions {
    return this.activeConfig.authOptions;
  }

  get systemOpitons(): SystemOptions {
    return this.activeConfig.systemOpitons;
  }
}
