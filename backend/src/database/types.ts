import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schemas";

export type Sqlite = BetterSQLite3Database<typeof schema>;
