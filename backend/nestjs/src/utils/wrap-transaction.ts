import { Database } from "src/drizzle/types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

export async function wrapTransaction<T>(
  db: Database,
  callback: (tx: Database) => Promise<T>,
) {
  try {
    return await db.transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (error: unknown) {
    throw new KalamcheError(KalamcheErrorType.DbQueryFailed, error);
  }
}
