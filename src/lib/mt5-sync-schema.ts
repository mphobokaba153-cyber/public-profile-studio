import { z } from "zod";

/**
 * Payload the PC-side MT5 bridge connector pushes over HTTPS.
 * Strict on purpose: unknown fields are rejected so the backend only ever
 * stores the read-only account data the app needs.
 */
export const mt5AccountSchema = z
  .object({
    platform: z.literal("MT5"),
    login: z.string().regex(/^\d{1,16}$/, "login must be the numeric MT5 account number"),
    server: z.string().min(1).max(120),
    currency: z.string().regex(/^[A-Za-z]{3}$/),
    balance: z.number().finite().min(-10_000_000).max(100_000_000),
    equity: z.number().finite().min(-10_000_000).max(100_000_000),
    margin: z.number().finite().min(0).max(100_000_000).nullable().optional(),
    free_margin: z.number().finite().min(-10_000_000).max(100_000_000).nullable().optional(),
    leverage: z.number().int().min(1).max(10_000).nullable().optional(),
    read_only: z.boolean(),
  })
  .strict();

export const mt5SyncPayloadSchema = z.discriminatedUnion("bridge_online", [
  z
    .object({
      bridge_online: z.literal(true),
      account: mt5AccountSchema,
      bridge_version: z.string().max(60).optional(),
    })
    .strict(),
  z
    .object({
      bridge_online: z.literal(false),
      reason: z.string().max(200).optional(),
    })
    .strict(),
]);

export type Mt5AccountSnapshot = z.infer<typeof mt5AccountSchema>;
export type Mt5SyncPayload = z.infer<typeof mt5SyncPayloadSchema>;
