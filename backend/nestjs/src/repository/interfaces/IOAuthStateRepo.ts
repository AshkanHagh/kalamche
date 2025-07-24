import { IOAuthStateInsertForm } from "src/drizzle/schemas";

export interface IOAuthStateRepo {
  insert(form: IOAuthStateInsertForm): Promise<void>;
}
