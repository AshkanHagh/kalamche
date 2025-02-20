import * as schema from "./schemas";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export type Postgres = NodePgDatabase<typeof schema>;
