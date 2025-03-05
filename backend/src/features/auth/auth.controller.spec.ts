import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { GithubOAuthProvider } from "./providers/github.provider";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [GithubOAuthProvider],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });
});
