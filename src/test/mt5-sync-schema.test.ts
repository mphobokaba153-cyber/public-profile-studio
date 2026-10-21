import { describe, expect, it } from "vitest";
import { mt5SyncPayloadSchema } from "@/lib/mt5-sync-schema";

const account = {
  platform: "MT5" as const,
  login: "88123456",
  server: "Exness-MT5Real",
  currency: "USD",
  balance: 1250.4,
  equity: 1248.1,
  margin: 0,
  free_margin: 1248.1,
  leverage: 500,
  read_only: true,
};

describe("mt5 sync payload schema", () => {
  it("accepts a valid account snapshot", () => {
    const parsed = mt5SyncPayloadSchema.safeParse({ bridge_online: true, account, bridge_version: "1.0.0" });
    expect(parsed.success).toBe(true);
  });

  it("rejects a non-numeric login", () => {
    const parsed = mt5SyncPayloadSchema.safeParse({
      bridge_online: true,
      account: { ...account, login: "abc-123" },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects unknown extra fields (nothing beyond read-only account data is stored)", () => {
    const parsed = mt5SyncPayloadSchema.safeParse({
      bridge_online: true,
      account: { ...account, password: "hunter2" },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects out-of-range balance values", () => {
    const parsed = mt5SyncPayloadSchema.safeParse({
      bridge_online: true,
      account: { ...account, balance: 999_999_999 },
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts the bridge-offline heartbeat", () => {
    const parsed = mt5SyncPayloadSchema.safeParse({ bridge_online: false, reason: "bridge unreachable" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.account).toBeUndefined();
  });

  it("rejects payloads without the bridge_online flag", () => {
    const parsed = mt5SyncPayloadSchema.safeParse({ account });
    expect(parsed.success).toBe(false);
  });
});
