import { z } from "zod";
/** Browser-visible configuration; no backend credentials are exposed. */
export const frontendEnvironment = z
  .object({ apiBaseUrl: z.union([z.url(), z.literal("")]) })
  .parse({ apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "" });
