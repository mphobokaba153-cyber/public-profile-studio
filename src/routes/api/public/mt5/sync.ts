import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { mt5SyncPayloadSchema } from "@/lib/mt5-sync-schema";

/**
 * Public ingest endpoint for the PC-side MT5 bridge connector.
 * The connector polls the local bridge (127.0.0.1) on the user's PC and
 * pushes the read-only account snapshot here over HTTPS. Caller is verified
 * with a shared sync secret (timing-safe compare); the bridge API key never
 * reaches this backend.
 */
export const Route = createFileRoute("/api/public/mt5/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["MT5_SYNC_SECRET"];
        if (!secret) {
          return new Response("Sync not configured", { status: 503 });
        }

        const provided = request.headers.get("x-sync-secret") ?? "";
        const a = Buffer.from(provided);
        const b = Buffer.from(secret);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        const parsed = mt5SyncPayloadSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ error: "Invalid payload" }, { status: 422 });
        }
        const payload = parsed.data;

        const now = new Date().toISOString();
        const row = payload.bridge_online
          ? {
              id: 1,
              bridge_online: true,
              platform: payload.account.platform,
              account_login: payload.account.login,
              broker_server: payload.account.server,
              currency: payload.account.currency.toUpperCase(),
              balance: payload.account.balance,
              equity: payload.account.equity,
              margin: payload.account.margin ?? null,
              free_margin: payload.account.free_margin ?? null,
              leverage: payload.account.leverage ?? null,
              read_only: payload.account.read_only,
              bridge_version: payload.bridge_version ?? null,
              offline_reason: null,
              synced_at: now,
              updated_at: now,
            }
          : {
              id: 1,
              bridge_online: false,
              offline_reason: payload.reason ?? null,
              updated_at: now,
            };

        // Caller verified above; privileged write only.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("mt5_account_state").upsert(row, { onConflict: "id" });
        if (error) {
          console.error("[mt5-sync] upsert failed:", error.message);
          return Response.json({ error: "Sync failed" }, { status: 500 });
        }

        return Response.json({ ok: true, synced_at: now });
      },
    },
  },
});
