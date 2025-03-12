import { Injectable } from "@nestjs/common";
import {
  AppConfig,
  AuthOptions,
  RuntimeAppConfig,
  SystemOptions,
  TestAppConfig,
} from "./app.config";
import { defaultConfig } from "./default.config";
import { testConfig } from "./test.config";

@Injectable()
export class ConfigService implements AppConfig {
  private activeConfig: RuntimeAppConfig | TestAppConfig;

  constructor() {
    if (process.env.KALAMCHE_INIT_WITH_TEST_ENV) {
      this.activeConfig = defaultConfig;
    } else {
      this.activeConfig = testConfig;
    }
  }

  get authOptions(): AuthOptions {
    return this.activeConfig.authOptions;
  }

  get systemOpitons(): SystemOptions {
    return this.activeConfig.systemOpitons;
  }
}
