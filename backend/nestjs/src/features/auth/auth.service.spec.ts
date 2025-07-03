import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { anything, instance, mock, verify, when } from "ts-mockito";
import { AuthUtilService } from "./util.service";
import { RepositoryService } from "src/repository/repository.service";
import { PendingUserRepository } from "src/repository/repositories/pending-user";
import { UserRepository } from "src/repository/repositories/user";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

describe("AuthService", () => {
  let service: AuthService;
  let mockPendingUserRepo: PendingUserRepository;
  let mockUserRepo: UserRepository;
  let mockUtilService: AuthUtilService;

  beforeEach(async () => {
    const mockAuthUtilService = mock(AuthUtilService);
    const mockRepo = mock(RepositoryService);
    mockPendingUserRepo = mock(PendingUserRepository);
    mockUserRepo = mock(UserRepository);
    mockUtilService = mockAuthUtilService;

    when(
      mockAuthUtilService.initiateAccountVerification(anything(), anything()),
    ).thenResolve("random token");
    when(mockRepo.pendingUser()).thenReturn(instance(mockPendingUserRepo));
    when(mockRepo.user()).thenReturn(instance(mockUserRepo));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: RepositoryService,
          useValue: instance(mockRepo),
        },
        {
          provide: AuthUtilService,
          useValue: instance(mockAuthUtilService),
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("should throw EmailAlreadyExists error when the email is already registered", async () => {
    when(mockUserRepo.emailExists(anything())).thenResolve(true);
    await expect(service.register(anything())).rejects.toThrow(
      new KalamcheError(KalamcheErrorType.EmailAlreadyExists),
    );
  });

  it("should successfully register a new user", async () => {
    when(mockUserRepo.emailExists(anything())).thenResolve(false);
    when(mockPendingUserRepo.findByEmail(anything())).thenResolve(undefined);
    when(mockPendingUserRepo.insert(anything())).thenResolve({
      email: "test@test.com",
      id: crypto.randomUUID(),
      passwordHash: "",
      token: "",
      createdAt: new Date(),
    });

    const result = service.register({
      email: "test@test.com",
      password: "test",
    });
    await expect(result).resolves.toBeDefined();

    // expect that user is not exists so we dont update the last attempt to register for user
    verify(mockPendingUserRepo.update(anything())).never();
    // if no pending user exists for user this fn most be called
    verify(mockPendingUserRepo.insert(anything())).called();
  });

  it("should update an existing pending user if registration is retried after cooldown", async () => {
    // Subtract one minute from the current time
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    setupUserRegistrationMocks(mockUserRepo, mockPendingUserRepo, date);

    const result = service.register({
      email: "test@test.com",
      password: "test",
    });
    await expect(result).resolves.toBeDefined();

    verify(mockPendingUserRepo.update(anything())).called();
    verify(mockPendingUserRepo.insert(anything())).never();
  });

  it("should throw RegistrationCooldown error if retrying registration within one minute", async () => {
    setupUserRegistrationMocks(mockUserRepo, mockPendingUserRepo);

    const result = service.register({
      email: "test@test.com",
      password: "test",
    });

    await expect(result).rejects.toThrow(
      new KalamcheError(KalamcheErrorType.RegistrationCooldown),
    );
    verify(
      mockUtilService.initiateAccountVerification(anything(), anything()),
    ).never();
  });

  it("should throw NotRegistered error when no pending user exists for the email", async () => {
    setupUserRegistrationMocks(
      mockUserRepo,
      mockPendingUserRepo,
      new Date(),
      false,
      false,
    );
    await expect(service.resendVerificationCode(anything())).rejects.toThrow(
      new KalamcheError(KalamcheErrorType.NotRegistered),
    );

    verify(
      mockUtilService.initiateAccountVerification(anything(), anything()),
    ).never();
  });

  it("should throw RegistrationCooldown error if retrying resend within one minute", async () => {
    setupUserRegistrationMocks(mockUserRepo, mockPendingUserRepo);

    await expect(service.resendVerificationCode(anything())).rejects.toThrow(
      new KalamcheError(KalamcheErrorType.RegistrationCooldown),
    );
    verify(
      mockUtilService.initiateAccountVerification(anything(), anything()),
    ).never();
  });

  it("should resend verification code for an existing pending user after cooldown", async () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    setupUserRegistrationMocks(mockUserRepo, mockPendingUserRepo, date);

    const result = service.resendVerificationCode(anything());

    await expect(result).resolves.toBeDefined();
    verify(
      mockUtilService.initiateAccountVerification(anything(), anything()),
    ).called();
  });
});

function setupUserRegistrationMocks(
  mockUserRepo: UserRepository,
  mockPendingUserRepo: PendingUserRepository,
  date: Date = new Date(),
  userExists: boolean = false,
  pendingUserExists: boolean = true,
) {
  when(mockUserRepo.emailExists(anything())).thenResolve(userExists);

  if (pendingUserExists) {
    when(mockPendingUserRepo.findByEmail(anything())).thenResolve({
      id: crypto.randomUUID(),
      email: "test@test.com",
      passwordHash: "",
      token: "",
      createdAt: date,
    });
  } else {
    when(mockPendingUserRepo.findByEmail(anything())).thenResolve(undefined);
  }
}
