import { IUser } from "src/drizzle/types";

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
