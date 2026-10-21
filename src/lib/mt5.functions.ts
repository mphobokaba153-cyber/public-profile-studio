import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Mt5SyncState = {
  bridge_online: boolean;
  platform: string | null;
  account_login: string | null;
  broker_server: string | null;
  currency: string;
  balance: number | null;
  equity: number | null;
  margin: number | null;
  free_margin: number | null;
  leverage: number | null;
  read_only: boolean;
  bridge_version: string | null;
  offline_reason: string | null;
  synced_at: string;
} | null;

/**
 * Read-only view of the latest MT5 account snapshot pushed by the PC-side
 * connector. Authenticated (bearer token required); RLS limits reads to
 * signed-in users.
 */
export const getMt5AccountState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mt5_account_state")
      .select(
        "bridge_online, platform, account_login, broker_server, currency, balance, equity, margin, free_margin, leverage, read_only, bridge_version, offline_reason, synced_at",
      )
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as Mt5SyncState;
  });
