import { useEffect, useRef, useState } from "react";
import { Upload, ScanLine, Loader2, X, Square, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RATIOS, type ScanResult } from "@/lib/scanner-rules";

const input = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
type Props = { symbols: string[]; log: (message: string) => void };
export function AiScanner({ symbols, log }: Props) {
  const [symbol, setSymbol] = useState(symbols[0] ?? "XAUUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [ratio, setRatio] = useState("auto");
  const [image, setImage] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [prices, setPrices] = useState({ h1Close: "", previousLow: "", previousHigh: "", entry: "" });
  const file = useRef<HTMLInputElement>(null);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const resetResult = () => { setResult(null); setError(""); setReasoning(""); };
  async function upload(selected: File | undefined) {
    resetResult(); setImage(null); setFilename("");
    if (!selected) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type)) { setError("Choose a PNG, JPG or WebP chart."); return; }
    if (selected.size === 0 || selected.size > 6 * 1024 * 1024) { setError("Choose a non-empty chart picture under 6 MB."); return; }
    try {
      const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(); reader.onerror = reject; reader.readAsDataURL(selected); });
      const decoded = new Image(); decoded.src = data; await decoded.decode();
      setImage(data); setFilename(selected.name);
    } catch { setError("This picture could not be opened. Choose another chart."); }
  }
  async function scan() {
    if (!image || busy) return;
    resetResult(); setBusy(true); setProgress("Reading chart…");
    const controller = new AbortController(); active.current = controller;
    try {
      const response = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image, symbol, timeframe, ratio, prices: Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v.trim() ? Number(v) : null])) }), signal: controller.signal });
      if (!response.ok) { const failure = await response.json(); throw new Error(failure.message || "Analysis is unavailable."); }
      if (!response.body) throw new Error("No analysis was returned.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let completed = false;
      const receive = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === "reasoning") { setReasoning((v) => v + event.text); setProgress("Checking your trading rules…"); }
        if (event.type === "progress") setProgress(event.message);
        if (event.type === "error") throw new Error(event.message);
        if (event.type === "result") { completed = true; setResult(event.result); log(`Chart scan ${symbol}: ${event.result.bias} • 1:${event.result.selectedRatio}`); }
      };
      try { while (true) { const chunk = await reader.read(); if (chunk.done) break; buffer += decoder.decode(chunk.value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() ?? ""; lines.forEach(receive); } receive(buffer + decoder.decode()); } finally { await reader.cancel(); }
      if (!completed) throw new Error("Analysis ended without a result. No signal was generated.");
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Analysis could not complete."); }
    finally { setBusy(false); setProgress(""); active.current = null; }
  }
  const format = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return <div className="space-y-4">
    <section className="space-y-3" aria-label="Chart scan settings">
      <h2 className="font-display text-xl font-bold">AI Scan</h2>
      <p className="text-xs text-muted-foreground">Matrix Scalper • Chart analysis only</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted-foreground">Pair<select aria-label="Chart pair" className={`${input} mt-1 text-foreground`} value={symbol} disabled={busy} onChange={(e) => { setSymbol(e.target.value); resetResult(); }}>{symbols.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="text-xs text-muted-foreground">Timeframe<select aria-label="Chart timeframe" className={`${input} mt-1 text-foreground`} value={timeframe} disabled={busy} onChange={(e) => { setTimeframe(e.target.value); resetResult(); }}>{["M1", "M5", "M15", "M30", "H1", "H4", "D1"].map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
      <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Upload chart picture" disabled={busy} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
      {image ? <div className="relative overflow-hidden rounded-lg border bg-card">
        <img src={image} alt="Uploaded trading chart" className="aspect-[4/3] w-full object-contain" />
        <Button variant="outline" size="icon" className="absolute right-2 top-2" aria-label="Remove chart" title="Remove chart" disabled={busy} onClick={() => { setImage(null); resetResult(); }}><X /></Button>
        <p className="truncate border-t px-3 py-2 text-xs text-muted-foreground">{filename}</p>
      </div> : <Button variant="outline" className="h-36 w-full flex-col border-dashed bg-card/70 text-foreground" onClick={() => file.current?.click()}><Upload className="!size-7 text-primary" /><span>Upload chart picture</span><span className="text-xs text-muted-foreground">PNG, JPG, WebP · up to 6 MB</span></Button>}
      {image && <Button variant="ghost" className="w-full" disabled={busy} onClick={() => file.current?.click()}><Upload />Replace picture</Button>}
      <fieldset disabled={busy}><legend className="mb-2 text-xs text-muted-foreground">Take profit · risk / reward</legend><div className="grid grid-cols-5 gap-1">{["auto", ...RATIOS.map(String)].map((r) => <Button key={r} variant={ratio === r ? "default" : "outline"} size="sm" aria-pressed={ratio === r} className="px-1" onClick={() => { setRatio(r); resetResult(); }}>{r === "auto" ? "Auto" : `1:${r}`}</Button>)}</div></fieldset>
      <details className="rounded-lg border bg-card/70 p-3" open>
        <summary className="flex cursor-pointer items-center justify-between text-xs font-bold">Strategy price evidence<ChevronDown className="size-4" /></summary>
        <p className="mt-2 text-xs text-muted-foreground">Previously stored candle-15 levels are required. Missing or unreadable evidence returns WAIT.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">{([ ["previousLow", "Previously stored low"], ["previousHigh", "Previously stored high"], ["h1Close", "Current H1 close"], ["entry", "Reference entry"] ] as const).map(([key, label]) => <label key={key} className="text-[10px] text-muted-foreground">{label}<input aria-label={label} type="number" step="any" min="0" disabled={busy} placeholder={key.startsWith("previous") ? "Required" : "Read from chart"} className={`${input} mt-1 text-foreground`} value={prices[key]} onChange={(e) => { setPrices({ ...prices, [key]: e.target.value }); resetResult(); }} /></label>)}</div>
      </details>
      <Button className="h-11 w-full font-bold" disabled={!image || busy} onClick={() => void scan()}>{busy ? <Loader2 className="animate-spin" /> : <ScanLine />}{busy ? progress : "Analyze chart"}</Button>
      {busy && <Button variant="outline" className="w-full" onClick={() => { active.current?.abort(); setError("Scan stopped. No signal was generated."); }}><Square />Stop scan</Button>}
      {error && <p role="alert" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm break-words">{error}</p>}
    </section>
    {reasoning && <details className="border-t pt-3"><summary className="cursor-pointer text-xs text-muted-foreground">Analysis notes</summary><p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{reasoning}</p></details>}
    {result && <section className="space-y-3 border-t pt-4" aria-label="Chart analysis result">
      <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">{result.symbol}</h3><span className={`rounded-full px-3 py-1 text-sm font-bold ${result.bias === "BUY" ? "bg-success/15 text-success" : result.bias === "SELL" ? "bg-accent/20 text-accent" : "bg-card text-muted-foreground"}`}>{result.bias}</span></div>
      <p className="text-sm">{result.reason}</p>
      {result.entry !== null && result.stopLoss !== null && <><dl className="grid grid-cols-2 gap-3 border-y py-3 text-sm"><div><dt className="text-xs text-muted-foreground">Reference entry</dt><dd className="mt-1 font-mono">{format(result.entry)}</dd></div><div><dt className="text-xs text-muted-foreground">Stop loss · 0.35%</dt><dd className="mt-1 font-mono">{format(result.stopLoss)}</dd></div></dl><div className="space-y-1">{result.targets.map((t) => <div key={t.ratio} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${t.ratio === result.selectedRatio ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><span>TP · 1:{t.ratio}{t.ratio === result.selectedRatio ? " · Selected" : ""}</span><span className="font-mono">{format(t.price)}</span></div>)}</div></>}
      <ul className="space-y-2 text-xs text-muted-foreground">{result.evidence.map((e, i) => <li key={i} className="break-words">• {e}</li>)}</ul>
      <p className="border-t pt-3 text-[10px] text-muted-foreground">Screenshot-based reference, not live execution prices. No trade placed. Targets are scenarios, not guaranteed returns.</p>
    </section>}
  </div>;
}