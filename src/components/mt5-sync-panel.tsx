import { useEffect, useState } from "react";
import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, LogOut, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { getMt5AccountState, type Mt5SyncState } from "@/lib/mt5.functions";

export type SessionState = "loading" | "out" | "in";
export type SyncStatus = "waiting" | "online" | "offline";

const STALE_AFTER_MS = 90_000; // connector default poll is 30s; 3 missed beats = offline

export function useMt5Session(): SessionState {
  const [state, setState] = useState<SessionState>("loading");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setState(data.session ? "in" : "out"));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setState("in");
      if (event === "SIGNED_OUT") setState("out");
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return state;
}

export function useMt5Sync() {
  const session = useMt5Session();
  const fetchState = useServerFn(getMt5AccountState);
  const query = useQuery({
    queryKey: ["mt5-sync"],
    queryFn: () => fetchState(),
    enabled: session === "in",
    refetchInterval: 30_000,
    retry: 1,
  });
  return { session, query };
}

export function deriveSyncStatus(row: Mt5SyncState, now = Date.now()): SyncStatus {
  if (!row.account_login) return "waiting";
  const synced = new Date(row.synced_at).getTime();
  if (!row.bridge_online || Number.isNaN(synced) || now - synced > STALE_AFTER_MS) return "offline";
  return "online";
}

export function formatMoney(value: number | null, currency: string): string {
  if (value == null || !Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(iso).toLocaleString();
}

function signIn(provider: "lovable" | "google") {
  return lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
}

function SignInCard() {
  const [busy, setBusy] = useState<"lovable" | "google" | null>(null);
  const start = (p: "lovable" | "google") => {
    setBusy(p);
    signIn(p).finally(() => setBusy(null));
  };
  return (
    <div className="space-y-3 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
      <p className="text-sm font-bold">Sign in to view your synced MT5 account</p>
      <p className="text-xs text-muted-foreground">
        Balance and equity are private — they only load for your signed-in account.
      </p>
      <div className="flex gap-2">
        <button onClick={() => start("lovable")} disabled={busy !== null} className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground transition active:scale-95 disabled:opacity-50">
          {busy === "lovable" ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Sign in with Lovable"}
        </button>
        <button onClick={() => start("google")} disabled={busy !== null} className="flex-1 rounded-xl border px-3 py-2.5 text-sm font-bold transition active:scale-95 disabled:opacity-50">
          {busy === "google" ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}

function SignOutButton({ className = "" }: { className?: string }) {
  const queryClient = useQueryClient();
  return (
    <button
      onClick={async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
      }}
      className={`flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground ${className}`}
    >
      <LogOut className="h-3 w-3" /> Sign out
    </button>
  );
}

export function Mt5SyncPanel({
  session,
  query,
}: {
  session: SessionState;
  query: UseQueryResult<Mt5SyncState, Error>;
}) {
  if (session === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border bg-card/70 p-4 text-xs text-muted-foreground backdrop-blur">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking sign-in…
      </div>
    );
  }

  if (session === "out") {
    return (
      <div className="rounded-3xl border bg-card/70 p-5 backdrop-blur">
        <SignInCard />
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border bg-card/70 p-4 text-xs text-muted-foreground backdrop-blur">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading account sync…
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="space-y-2 rounded-2xl border border-destructive/40 bg-card/70 p-4 text-xs backdrop-blur">
        <div className="flex items-center gap-2 font-bold text-destructive">
          <XCircle className="h-4 w-4" /> Couldn’t load account sync
        </div>
        <p className="text-muted-foreground">Your session may have expired. Try again, or sign in again.</p>
        <div className="flex items-center justify-between pt-1">
          <button onClick={() => query.refetch()} className="flex items-center gap-1 rounded-xl border px-3 py-1.5 font-bold">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
          <SignOutButton />
        </div>
      </div>
    );
  }

  const row = query.data;
  if (!row || !row.account_login) {
    return (
      <div className="space-y-2 rounded-2xl border bg-card/70 p-4 text-xs backdrop-blur">
        <p className="font-bold">No account synced yet</p>
        <p className="text-muted-foreground">
          Start the connector on your PC (it reads your local MT5 bridge and pushes the account here). Nothing has been
          received yet.
        </p>
        <SignOutButton />
      </div>
    );
  }

  const status = deriveSyncStatus(row);
  const online = status === "online";

  return (
    <div className="space-y-3 rounded-2xl border bg-card/70 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold">
          {online ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <span className="text-success">Live sync connected</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Disconnected</span>
            </>
          )}
        </div>
        <span className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-success" /> READ-ONLY
        </span>
      </div>

      {!online && row.offline_reason && <p className="text-xs text-muted-foreground">Bridge says: {row.offline_reason}</p>}
      {!online && <p className="text-xs text-muted-foreground">Make sure the MT5 terminal, bridge and connector are running on your PC.</p>}

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div><span className="text-muted-foreground">Login</span><div className="font-mono font-bold">{row.account_login}</div></div>
        <div><span className="text-muted-foreground">Server</span><div className="font-bold">{row.broker_server ?? "—"}</div></div>
        <div><span className="text-muted-foreground">Balance</span><div className="font-bold">{formatMoney(row.balance, row.currency)}</div></div>
        <div><span className="text-muted-foreground">Equity</span><div className="font-bold">{formatMoney(row.equity, row.currency)}</div></div>
        {row.leverage != null && (
          <div><span className="text-muted-foreground">Leverage</span><div className="font-bold">1:{row.leverage}</div></div>
        )}
        <div><span className="text-muted-foreground">Currency</span><div className="font-bold">{row.currency}</div></div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-success" /> Last sync {timeAgo(row.synced_at)}
        </span>
        <SignOutButton />
      </div>
    </div>
  );
}
