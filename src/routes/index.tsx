import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Square, Home, BarChart3, ScrollText, Link2, ScanLine, Plus, Trash2, Server, FileCode2, Radio, CheckCircle2, Loader2, X } from "lucide-react";
import bot from "@/assets/bot.jpg";
import { AiScanner } from "@/components/ai-scanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MPHO FX — Nova AI Trading Bot" },
      { name: "description", content: "MPHO FX: run your trading bot, manage mentor pairs, connect MetaTrader and scan markets with AI." },
      { property: "og:title", content: "MPHO FX — Nova AI Trading Bot" },
      { property: "og:description", content: "Modern mobile trading bot powered by NextraPro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Manrope:wght@400;600;700&display=swap" },
    ],
  }),
  component: Index,
});

const MENTOR_PAIRS = ["XAUUSD", "EURUSD", "GBPUSD", "GBPJPY", "USDJPY", "US30", "NAS100", "BTCUSD"];
type Pair = { id: string; symbol: string; lot: number; trades: number; on: boolean };
type Account = { login: string; server: string; platform: "MT4" | "MT5"; connected: boolean };
const PLATFORM_NAME: Record<"MT4" | "MT5", string> = { MT4: "MetaTrader 4", MT5: "MetaTrader 5" };

function usePersist<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  useEffect(() => { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); }, [key]);
  const set = (n: T | ((p: T) => T)) => setV((p) => { const val = typeof n === "function" ? (n as (p: T) => T)(p) : n; localStorage.setItem(key, JSON.stringify(val)); return val; });
  return [v, set] as const;
}

const card = "rounded-3xl border bg-card/70 backdrop-blur p-5";
const input = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const btn = "rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition active:scale-95 disabled:opacity-50";

function Index() {
  const [nav, setNav] = useState<"mt" | "home" | "ai">("home");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [tab, setTab] = useState<"pairs" | "logs" | null>(null);
  const [pairs, setPairs] = usePersist<Pair[]>("pairs", []);
  const [account, setAccount] = usePersist<Account | null>("account", null);
  const [logs, setLogs] = usePersist<string[]>("logs", []);
  const [robots, setRobots] = usePersist<string[]>("robots", ["Nova AI", "Gold Sniper"]);
  const log = (m: string) => setLogs((l) => [`${new Date().toLocaleTimeString()}  ${m}`, ...l].slice(0, 60));

  const toggle = () => {
    if (running) { setRunning(false); setStage(0); log("Bot stopped"); return; }
    setRunning(true); setStage(1); log("Server ON");
    setTimeout(() => { setStage(2); log("Script reading signals"); }, 900);
    setTimeout(() => { setStage(3); log(`Listening on ${pairs.filter((p) => p.on).map((p) => p.symbol).join(", ") || "no active pairs"}`); }, 1800);
  };

  return (
    <main className="neon-bg flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border bg-background/80 backdrop-blur-xl glow">
        {running && (
          <div className="pop-in absolute right-4 top-16 z-50 flex items-center gap-2 rounded-full border bg-card/90 p-1.5 pr-4 backdrop-blur">
            <img src={bot} alt="Bot running" className="pulse-ring h-10 w-10 rounded-full object-cover" />
            <div className="text-xs">
              <div className="font-bold text-primary">{["", "Server on", "Script on", "Signal on"][stage]}</div>
              <div className="text-muted-foreground">{["", "Starting…", "Reading script…", "Waiting for signal"][stage]}</div>
            </div>
          </div>
        )}

        {nav === "home" && (
          <>
            <div className="relative h-[400px]">
              <img src={bot} alt="Nova AI robot" width={768} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />
              <div className="relative flex flex-col items-center pt-6">
                <div className="flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 backdrop-blur">
                  <span className="font-display text-sm font-bold tracking-wider">MPHO FX</span>
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">PRO</span>
                </div>
                <div className={`mt-8 h-32 w-32 overflow-hidden rounded-full border-2 border-primary ${running ? "pulse-ring" : "glow"}`}>
                  <img src={bot} alt="" className="h-full w-full object-cover" />
                </div>
                <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">Nova AI</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {running ? <span className="text-success">● Trading live</span> : "Fully automated mobile EA"}
                </p>
              </div>
            </div>

            <div className="relative -mt-6 px-5">
              <div className="flex items-center justify-between rounded-full border bg-card/80 px-6 py-2 backdrop-blur-xl">
                <button onClick={() => setTab(tab === "pairs" ? null : "pairs")} className={`flex flex-col items-center gap-0.5 text-xs font-bold ${tab === "pairs" ? "text-primary" : ""}`}>
                  <BarChart3 className="h-5 w-5" /> PAIRS
                </button>
                <button onClick={toggle} className={`-my-6 flex h-20 w-20 flex-col items-center justify-center rounded-full font-display text-xs font-bold transition active:scale-95 ${running ? "bg-accent text-foreground pulse-ring" : "bg-primary text-primary-foreground glow"}`}>
                  {running ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {running ? "STOP" : "START"}
                </button>
                <button onClick={() => setTab(tab === "logs" ? null : "logs")} className={`flex flex-col items-center gap-0.5 text-xs font-bold ${tab === "logs" ? "text-primary" : ""}`}>
                  <ScrollText className="h-5 w-5" /> LOGS
                </button>
              </div>

              {tab === "pairs" && <div className="mt-4"><PairsPanel pairs={pairs} setPairs={setPairs} log={log} /></div>}
              {tab === "logs" && (
                <div className="mt-4 space-y-3">
                  <ScriptPanel running={running} log={log} />
                  <div className={`${card} max-h-40 space-y-1 overflow-auto font-mono text-xs text-muted-foreground`}>
                    {logs.length ? logs.map((l, i) => <div key={i}>{l}</div>) : "No activity yet."}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <span className="rounded-full border bg-card/60 px-4 py-1 text-xs">Powered by <b className="text-primary">NextraPro</b></span>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold">Robot List</h2>
                <button onClick={() => setRobots((r) => [...r, `Bot ${r.length + 1}`])} className="rounded-full bg-primary/15 p-1 text-primary" aria-label="Add robot"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 space-y-2 pb-4">
                {robots.map((r) => (
                  <div key={r} className="flex items-center gap-3 rounded-2xl border bg-card/70 p-2 backdrop-blur">
                    <img src={bot} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <span className="flex-1 font-bold">{r}</span>
                    <button onClick={() => setRobots((x) => x.filter((y) => y !== r))} className="rounded-full bg-background p-1" aria-label="Remove robot"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {nav !== "home" && (
          <div className="min-h-[640px] p-5 pt-6">
            {nav === "mt" ? <MtTab account={account} setAccount={setAccount} log={log} /> : <AiTab pairs={pairs} log={log} />}
          </div>
        )}

        <nav className="flex justify-around border-t bg-card/80 py-3 text-xs backdrop-blur-xl">
          {([["mt", "MetaTrader", Link2], ["home", "Home", Home], ["ai", "AI Scan", ScanLine]] as const).map(([k, n, Icon]) => (
            <button key={k} onClick={() => setNav(k)} className={`flex flex-col items-center gap-1 ${nav === k ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="h-5 w-5" />{n}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}

function PairsPanel({ pairs, setPairs, log }: { pairs: Pair[]; setPairs: any; log: (m: string) => void }) {
  const [form, setForm] = useState({ symbol: MENTOR_PAIRS[0], lot: 0.01, trades: 1 });
  const save = () => {
    setPairs((p: Pair[]) => [...p, { id: crypto.randomUUID(), ...form, on: true }]);
    log(`Saved ${form.symbol} • lot ${form.lot} • ${form.trades} trades`);
  };
  return (
    <div className="space-y-3">
      <div className={card}>
        <p className="mb-3 text-sm font-bold">Add mentor pair</p>
        <div className="grid grid-cols-3 gap-2">
          <select className={input} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}>
            {MENTOR_PAIRS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <label className="text-[10px] text-muted-foreground">Lot size<input type="number" step="0.01" min="0.01" className={input} value={form.lot} onChange={(e) => setForm({ ...form, lot: +e.target.value })} /></label>
          <label className="text-[10px] text-muted-foreground">Trades<input type="number" min="1" className={input} value={form.trades} onChange={(e) => setForm({ ...form, trades: +e.target.value })} /></label>
        </div>
        <button onClick={save} className={`${btn} mt-3 flex w-full items-center justify-center gap-1`}><Plus className="h-4 w-4" />Save pair</button>
      </div>
      {pairs.map((p) => (
        <div key={p.id} className={`${card} flex items-center gap-3 !p-4`}>
          <div className="flex-1">
            <div className="font-display font-bold">{p.symbol}</div>
            <div className="text-xs text-muted-foreground">Lot {p.lot} • {p.trades} trades</div>
          </div>
          <button onClick={() => { setPairs((x: Pair[]) => x.map((y) => y.id === p.id ? { ...y, on: !y.on } : y)); log(`${p.symbol} switched ${p.on ? "OFF" : "ON"}`); }}
            className={`relative h-7 w-12 rounded-full transition ${p.on ? "bg-primary" : "bg-background border"}`} aria-label="Toggle pair">
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-foreground transition-all ${p.on ? "left-6" : "left-1"}`} />
          </button>
          <button onClick={() => setPairs((x: Pair[]) => x.filter((y) => y.id !== p.id))} className="text-muted-foreground" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}

function ScriptPanel({ running, log }: { running: boolean; log: (m: string) => void }) {
  const [text, setText] = useState("BUY XAUUSD @ 2350 SL 2340 TP 2370");
  const [sent, setSent] = useState<string[]>([]);
  const send = () => {
    const m = text.toUpperCase().match(/(BUY|SELL)\s+([A-Z0-9]+)/);
    if (!m) { log("Signal not understood — use e.g. BUY XAUUSD SL 2340 TP 2370"); return; }
    setSent((s) => [text, ...s]);
    log(running ? `Signal executed: ${text}` : `Signal queued (bot off): ${text}`);
    setText("");
  };
  return (
    <div className={card}>
      <p className="mb-2 text-sm font-bold">Write a signal</p>
      <textarea rows={3} className={`${input} font-mono`} value={text} onChange={(e) => setText(e.target.value)} placeholder="BUY XAUUSD @ 2350 SL 2340 TP 2370" />
      <button onClick={send} disabled={!text.trim()} className={`${btn} mt-2 w-full`}>Send signal</button>
      <div className="mt-3 space-y-1">
        {sent.map((s, i) => <div key={i} className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{s}</div>)}
      </div>
    </div>
  );
}

function MtCard({ account, busy }: { account: Account | null; busy: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-background to-card p-5 glow">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-accent/15 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-bold tracking-wide">{account?.connected ? PLATFORM_NAME[account.platform] : "MetaTrader"}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{account?.connected ? "MetaTrader • NextraPro" : "MPHO FX • NextraPro"}</p>
        </div>
        <img src={bot} alt="" className="h-10 w-10 rounded-full border border-primary/40 object-cover" />
      </div>
      <div className="relative mt-6 flex items-center gap-2">
        <span className="h-8 w-11 rounded-md border border-gold/60 bg-gold/20" />
        <Radio className={`h-4 w-4 ${account?.connected ? "text-success" : "text-muted-foreground"}`} />
      </div>
      <div className="relative mt-4">
        {account?.connected ? (
          <>
            <p className="font-mono text-lg font-bold tracking-[0.2em]">{account.login.replace(/\B(?=(\d{4})+$)/g, " ")}</p>
            <div className="mt-2 flex items-end justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{account.server}</span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 font-bold text-success">{PLATFORM_NAME[account.platform]} • LIVE</span>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-lg font-bold tracking-[0.2em] text-muted-foreground">•••• •••• ••••</p>
            <div className="mt-2 flex items-end justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{busy ? "Connecting…" : "No account linked"}</span>
              <span className="rounded-full bg-background px-2 py-0.5 font-bold">{busy ? "WAIT" : "OFFLINE"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MtTab({ account, setAccount, log }: { account: Account | null; setAccount: any; log: (m: string) => void }) {
  const [f, setF] = useState({ login: "", password: "", server: "", platform: "MT5" as "MT4" | "MT5" });
  const [busy, setBusy] = useState(false);
  const connect = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); setAccount({ login: f.login, server: f.server, platform: f.platform, connected: true }); log(`Connected ${PLATFORM_NAME[f.platform]} • ${f.login}`); }, 1200);
  };
  return (
    <div className="space-y-4">
      <MtCard account={account} busy={busy} />
      {account?.connected ? (
        <div className={`${card} text-center`}>
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h2 className="mt-2 font-display text-lg font-bold">Account connected</h2>
          <p className="text-sm text-muted-foreground">{PLATFORM_NAME[account.platform]} • {account.login} • {account.server}</p>
          <button onClick={() => { setAccount(null); log("MetaTrader disconnected"); }} className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-sm"><X className="h-4 w-4" />Disconnect</button>
        </div>
      ) : (
        <div className={`${card} space-y-3`}>
          <h2 className="font-display text-xl font-bold">Connect account</h2>
          <div className="flex gap-2">
            {(["MT4", "MT5"] as const).map((p) => <button key={p} onClick={() => setF({ ...f, platform: p })} className={`flex-1 rounded-xl border py-2 text-sm font-bold ${f.platform === p ? "border-primary text-primary" : "text-muted-foreground"}`}>{PLATFORM_NAME[p]}</button>)}
          </div>
          <input className={input} placeholder="Login ID" value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} />
          <input className={input} type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <input className={input} placeholder="Server (e.g. Exness-MT5Real)" value={f.server} onChange={(e) => setF({ ...f, server: e.target.value })} />
          <button onClick={connect} disabled={busy || !f.login || !f.password || !f.server} className={`${btn} flex w-full items-center justify-center gap-2`}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Connecting…" : "Connect account"}
          </button>
        </div>
      )}
    </div>
  );
}

function AiTab({ pairs, log }: { pairs: Pair[]; log: (m: string) => void }) {
  const options = pairs.length ? [...new Set(pairs.map((p) => p.symbol))] : MENTOR_PAIRS;
  return <AiScanner symbols={options} log={log} />;
}
