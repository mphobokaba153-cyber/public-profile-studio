export const RATIOS = [1, 2, 3, 4] as const;
export type Ratio = (typeof RATIOS)[number];
export type PriceEvidence = { h1Close: number | null; previousLow: number | null; previousHigh: number | null; entry: number | null };
export type ScanResult = { bias: "BUY" | "SELL" | "WAIT"; reason: string; evidence: string[]; entry: number | null; stopLoss: number | null; targets: { ratio: Ratio; price: number }[]; selectedRatio: Ratio; symbol: string; timeframe: string };

const valid = (n: number | null): n is number => n !== null && Number.isFinite(n) && n > 0;
export function evaluateStrategy(p: PriceEvidence, ratio: Ratio): Pick<ScanResult, "bias" | "reason" | "entry" | "stopLoss" | "targets"> {
  if (!RATIOS.includes(ratio)) throw new Error("Unsupported profit ratio");
  const wait = (reason: string) => ({ bias: "WAIT" as const, reason, entry: null, stopLoss: null, targets: [] });
  if (!valid(p.h1Close) || !valid(p.previousLow) || !valid(p.previousHigh)) return wait("Current H1 close and both previously stored levels are required.");
  if (p.previousHigh < p.previousLow) return wait("The previously stored high cannot be below the low.");
  const bias = p.h1Close > p.previousLow ? "BUY" : p.h1Close < p.previousHigh ? "SELL" : "WAIT";
  if (bias === "WAIT") return wait("Neither strict price comparison passed.");
  if (!valid(p.entry)) return wait("A readable reference entry price is required.");
  const entry = p.entry;
  const risk = entry * 0.0035;
  const direction = bias === "BUY" ? 1 : -1;
  return { bias, reason: bias === "BUY" ? "H1 close is above the previously stored low; BUY has precedence." : "BUY failed and H1 close is below the previously stored high.", entry, stopLoss: entry - direction * risk, targets: RATIOS.map((r) => ({ ratio: r, price: entry + direction * risk * r })) };
}