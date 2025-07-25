import { Injectable } from "@nestjs/common";
import { IUserService } from "./interfaces/IService";
import { UserRepository } from "src/repository/repositories/user.repository";

@Injectable()
export class UserService implements IUserService {
  constructor(private userRepository: UserRepository) {}
}
