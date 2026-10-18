import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Square, Home, Link2, ScanLine, Plus, Trash2, Server, FileCode2, Radio, CheckCircle2, Loader2, X } from "lucide-react";
import bot from "@/assets/bot.jpg";

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
  const [stage, setStage] = useState(0); // 0 off,1 server,2 script,3 signal
  const [pairs, setPairs] = usePersist<Pair[]>("pairs", []);
  const [account, setAccount] = usePersist<Account | null>("account", null);
  const [logs, setLogs] = usePersist<string[]>("logs", []);
  const log = (m: string) => setLogs((l) => [`${new Date().toLocaleTimeString()}  ${m}`, ...l].slice(0, 60));

  const toggle = () => {
    if (running) { setRunning(false); setStage(0); log("Bot stopped"); return; }
    setRunning(true); setStage(1); log("Server ON");
    setTimeout(() => { setStage(2); log("Script reading signals"); }, 900);
    setTimeout(() => { setStage(3); log(`Listening on ${pairs.filter((p) => p.on).map((p) => p.symbol).join(", ") || "no active pairs"}`); }, 1800);
  };

  return (
    <main className="neon-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
        <header className="mb-5 flex items-center gap-3">
          <img src={bot} alt="" className="h-10 w-10 rounded-2xl object-cover" />
          <div className="flex-1">
            <div className="font-display text-lg font-bold leading-none">MPHO FX</div>
            <div className="text-xs text-muted-foreground">Powered by <b className="text-primary">NextraPro</b></div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${account?.connected ? "bg-success/15 text-success" : "bg-card text-muted-foreground"}`}>
            {account?.connected ? `${account.platform} • ${account.login}` : "Not connected"}
          </span>
        </header>

        {nav === "home" && <HomeTab {...{ running, stage, toggle, pairs, setPairs, logs, log }} />}
        {nav === "mt" && <MtTab account={account} setAccount={setAccount} log={log} />}
        {nav === "ai" && <AiTab pairs={pairs} log={log} />}
      </div>

      {running && (
        <div className="pop-in fixed right-4 top-20 z-50 flex items-center gap-2 rounded-full border bg-card/90 p-1.5 pr-4 backdrop-blur glow">
          <img src={bot} alt="Bot running" className="pulse-ring h-11 w-11 rounded-full object-cover" />
          <div className="text-xs">
            <div className="font-bold text-primary">Nova AI live</div>
            <div className="text-muted-foreground">{["", "Server on…", "Reading script…", "Waiting for signal"][stage]}</div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-xs items-center justify-around rounded-full border bg-card/90 p-2 backdrop-blur">
        {([["mt", "MT Connect", Link2], ["home", "Home", Home], ["ai", "AI Scan", ScanLine]] as const).map(([k, n, Icon]) => (
          <button key={k} onClick={() => setNav(k)} className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[11px] font-semibold transition ${nav === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Icon className="h-5 w-5" />{n}
          </button>
        ))}
      </nav>
    </main>
  );
}

function HomeTab({ running, stage, toggle, pairs, setPairs, logs, log }: any) {
  const [tab, setTab] = useState<"pairs" | "script" | "logs">("pairs");
  const steps = [["Server", Server], ["Script", FileCode2], ["Signal", Radio]] as const;
  return (
    <div className="space-y-4">
      <section className={`${card} relative overflow-hidden text-center`}>
        <img src={bot} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Nova AI</p>
          <h1 className="font-display text-3xl font-bold">{running ? "Trading live" : "Bot offline"}</h1>
          <button onClick={toggle} className={`mx-auto mt-5 flex h-28 w-28 flex-col items-center justify-center rounded-full font-display text-sm font-bold transition active:scale-95 ${running ? "bg-destructive pulse-ring bg-accent text-foreground" : "bg-primary text-primary-foreground glow"}`}>
            {running ? <Square className="h-7 w-7" /> : <Play className="h-7 w-7" />}{running ? "STOP" : "START"}
          </button>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {steps.map(([n, Icon], i) => (
              <div key={n} className={`rounded-2xl border p-2 text-xs ${stage > i ? "border-primary text-primary" : "text-muted-foreground"}`}>
                <Icon className="mx-auto mb-1 h-4 w-4" />{n} {stage > i ? "ON" : "off"}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex rounded-full border bg-card/70 p-1">
        {(["pairs", "script", "logs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize ${tab === t ? "bg-background text-primary" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "pairs" && <PairsPanel pairs={pairs} setPairs={setPairs} log={log} />}
      {tab === "script" && <ScriptPanel running={running} log={log} />}
      {tab === "logs" && (
        <div className={`${card} max-h-72 space-y-1 overflow-auto font-mono text-xs text-muted-foreground`}>
          {logs.length ? logs.map((l: string, i: number) => <div key={i}>{l}</div>) : "No activity yet."}
        </div>
      )}
    </div>
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

function MtTab({ account, setAccount, log }: { account: Account | null; setAccount: any; log: (m: string) => void }) {
  const [f, setF] = useState({ login: "", password: "", server: "", platform: "MT5" as "MT4" | "MT5" });
  const [busy, setBusy] = useState(false);
  if (account?.connected) return (
    <div className={`${card} text-center`}>
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
      <h2 className="mt-2 font-display text-xl font-bold">Account connected</h2>
      <p className="text-sm text-muted-foreground">{account.platform} • {account.login} • {account.server}</p>
      <button onClick={() => { setAccount(null); log("MetaTrader disconnected"); }} className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-sm"><X className="h-4 w-4" />Disconnect</button>
    </div>
  );
  const connect = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); setAccount({ login: f.login, server: f.server, platform: f.platform, connected: true }); log(`Connected ${f.platform} ${f.login}`); }, 1200);
  };
  return (
    <div className={`${card} space-y-3`}>
      <h2 className="font-display text-xl font-bold">MetaTrader Connect</h2>
      <div className="flex gap-2">
        {(["MT4", "MT5"] as const).map((p) => <button key={p} onClick={() => setF({ ...f, platform: p })} className={`flex-1 rounded-xl border py-2 text-sm font-bold ${f.platform === p ? "border-primary text-primary" : "text-muted-foreground"}`}>{p}</button>)}
      </div>
      <input className={input} placeholder="Login ID" value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} />
      <input className={input} type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <input className={input} placeholder="Server (e.g. Exness-MT5Real)" value={f.server} onChange={(e) => setF({ ...f, server: e.target.value })} />
      <button onClick={connect} disabled={busy || !f.login || !f.password || !f.server} className={`${btn} flex w-full items-center justify-center gap-2`}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Connecting…" : "Connect account"}
      </button>
    </div>
  );
}

function AiTab({ pairs, log }: { pairs: Pair[]; log: (m: string) => void }) {
  const options = pairs.length ? [...new Set(pairs.map((p) => p.symbol))] : MENTOR_PAIRS;
  const [sym, setSym] = useState(options[0]);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ bias: string; conf: number; trend: string; zone: string } | null>(null);
  const scan = () => {
    setBusy(true); setRes(null);
    setTimeout(() => {
      const bias = Math.random() > 0.5 ? "BUY" : "SELL";
      const r = { bias, conf: 60 + Math.floor(Math.random() * 35), trend: bias === "BUY" ? "Bullish structure, higher lows" : "Bearish structure, lower highs", zone: bias === "BUY" ? "Demand zone below price" : "Supply zone above price" };
      setRes(r); setBusy(false); log(`AI scan ${sym}: ${r.bias} (${r.conf}%)`);
    }, 1600);
  };
  return (
    <div className="space-y-4">
      <div className={`${card} space-y-3`}>
        <h2 className="font-display text-xl font-bold">AI Scan</h2>
        <select className={input} value={sym} onChange={(e) => setSym(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>
        <button onClick={scan} disabled={busy} className={`${btn} flex w-full items-center justify-center gap-2`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}{busy ? "Scanning market…" : "Scan now"}
        </button>
      </div>
      {res && (
        <div className={`${card} pop-in`}>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold">{sym}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${res.bias === "BUY" ? "bg-success/15 text-success" : "bg-accent/20 text-accent"}`}>{res.bias}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-background"><div className="h-2 rounded-full bg-primary" style={{ width: `${res.conf}%` }} /></div>
          <p className="mt-1 text-xs text-muted-foreground">Confidence {res.conf}%</p>
          <p className="mt-3 text-sm">{res.trend}</p>
          <p className="text-sm text-muted-foreground">{res.zone}</p>
        </div>
      )}
    </div>
  );
}
