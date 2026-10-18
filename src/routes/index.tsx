import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Play, Square, ScrollText, Home, Monitor, Settings, X, Plus } from "lucide-react";
import bot from "@/assets/bot.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova AI — Automated Mobile Trading Bot" },
      { name: "description", content: "Nova AI: a fully automated mobile expert advisor for forex trading." },
      { property: "og:title", content: "Nova AI — Automated Mobile Trading Bot" },
      { property: "og:description", content: "Fully automated mobile EA with neon style." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&display=swap" },
    ],
  }),
  component: Index,
});

const pairsList = ["XAUUSD", "EURUSD", "GBPJPY", "US30"];

function Index() {
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"pairs" | "logs" | null>(null);
  const [logs, setLogs] = useState<string[]>(["Nova AI ready."]);
  const [robots, setRobots] = useState(["Nova AI", "Gold Sniper"]);
  const [nav, setNav] = useState("Home");

  const toggle = () => {
    const now = new Date().toLocaleTimeString();
    setLogs((l) => [`${now} — ${running ? "Bot stopped" : "Bot started on " + pairsList.join(", ")}`, ...l]);
    setRunning(!running);
  };

  return (
    <main className="neon-bg flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border-4 border-card bg-background glow">
        <div className="relative h-[420px]">
          <img src={bot} alt="Nova AI robot" width={768} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
          <div className="relative flex flex-col items-center pt-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tracking-wider">MPHO FX</span>
              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">PRO</span>
            </div>
            <div className={`mt-8 h-32 w-32 overflow-hidden rounded-full border-4 border-primary glow ${running ? "pulse-ring" : ""}`}>
              <img src={bot} alt="" className="h-full w-full object-cover" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-black tracking-wide">Nova AI</h1>
            <p className="mt-2 text-muted-foreground">
              {running ? <span className="text-success">● Trading live</span> : "Fully automated mobile EA"}
            </p>
          </div>
        </div>

        <div className="relative -mt-6 px-6">
          <div className="flex items-center justify-between rounded-full border-2 border-primary bg-card px-6 py-2 glow">
            <button onClick={() => setTab(tab === "pairs" ? null : "pairs")} className="flex flex-col items-center text-xs font-bold">
              <BarChart3 className="h-5 w-5" /> PAIRS
            </button>
            <button onClick={toggle} className="-my-6 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground glow">
              {running ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {running ? "STOP" : "START"}
            </button>
            <button onClick={() => setTab(tab === "logs" ? null : "logs")} className="flex flex-col items-center text-xs font-bold">
              <ScrollText className="h-5 w-5" /> LOGS
            </button>
          </div>

          {tab && (
            <div className="mt-4 max-h-36 overflow-auto rounded-xl border bg-card p-3 text-sm">
              {tab === "pairs"
                ? pairsList.map((p) => <div key={p} className="flex justify-between py-1"><span>{p}</span><span className="text-success">active</span></div>)
                : logs.map((l, i) => <div key={i} className="py-0.5 text-muted-foreground">{l}</div>)}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <span className="rounded-full border bg-card px-4 py-1 text-xs">Powered by <b className="text-primary">NextraPro</b></span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="font-display text-sm">Robot List</h2>
            <button onClick={() => setRobots((r) => [...r, `Bot ${r.length + 1}`])} className="text-primary"><Plus className="h-5 w-5" /></button>
          </div>
          <div className="mt-2 space-y-2 pb-4">
            {robots.map((r) => (
              <div key={r} className="flex items-center gap-3 rounded-xl border-2 border-primary/60 bg-card p-2">
                <img src={bot} alt="" className="h-9 w-9 rounded-full object-cover" />
                <span className="flex-1 font-bold">{r}</span>
                <button onClick={() => setRobots((x) => x.filter((y) => y !== r))} className="rounded-full bg-background p-1"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <nav className="flex justify-around border-t bg-card py-3 text-xs">
          {[["Home", Home], ["Metatrader", Monitor], ["Settings", Settings]].map(([n, Icon]: any) => (
            <button key={n} onClick={() => setNav(n)} className={`flex flex-col items-center gap-1 ${nav === n ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="h-5 w-5" />{n}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
