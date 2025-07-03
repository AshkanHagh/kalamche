import { RegisterDto } from "../dto";

export interface IAuthService {
  register(payload: RegisterDto): Promise<string>;
}
