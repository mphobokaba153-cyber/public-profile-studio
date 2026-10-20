import { z } from "zod";
export const extractionSchema = z.object({
  isChart: z.boolean(), symbolMatches: z.boolean(), timeframeMatches: z.boolean(),
  h1Close: z.number().nullable(), entry: z.number().nullable(),
  selectedRatio: z.enum(["1", "2", "3", "4"]),
  evidence: z.array(z.string()), limitations: z.array(z.string()),
}).strict();