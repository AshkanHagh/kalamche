import { IUser } from "src/drizzle/schemas";

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
