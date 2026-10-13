import type { Plan, PlanInput } from "../../../../shared/calendarContracts.js";
/** Calendar persistence can be observed in HTTP tests without replacing PostgreSQL in production. */
export interface PlanRepository {
  list: () => Promise<Plan[]>;
  save: (input: PlanInput, id?: string) => Promise<Plan | null>;
  remove: (id: string) => Promise<boolean>;
}
