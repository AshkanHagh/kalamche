import { HttpException, HttpStatus } from "@nestjs/common";

export class EmailAlreadyExistsException extends HttpException {
  constructor() {
    super("email already exists", HttpStatus.CONFLICT);
  }
}

export class AccountPendingToVerifyException extends HttpException {
  constructor() {
    super("email already exists", HttpStatus.CONFLICT);
  }
}
