import { RegisterDto } from "../dto";
import { RegisterResponse } from "../types";

export interface IAuthController {
  register(payload: RegisterDto): Promise<RegisterResponse>;
}
