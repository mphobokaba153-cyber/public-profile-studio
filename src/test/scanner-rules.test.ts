import { describe, it, expect } from "vitest";
import { evaluateStrategy } from "@/lib/scanner-rules";
describe("Uploaded Matrix strategy", () => {
  const buy = { h1Close: 100, previousLow: 90, previousHigh: 110, entry: 100 };
  it("checks BUY before SELL when both comparisons pass", () => expect(evaluateStrategy(buy, 1).bias).toBe("BUY"));
  it("selects SELL only when BUY fails", () => expect(evaluateStrategy({ ...buy, h1Close: 85 }, 1).bias).toBe("SELL"));
  it("waits when stored price evidence is missing", () => expect(evaluateStrategy({ ...buy, previousLow: null }, 1).bias).toBe("WAIT"));
  it("does not invent an entry", () => expect(evaluateStrategy({ ...buy, entry: null }, 1).targets).toEqual([]));
  it("uses the supplied 0.35% stop loss", () => expect(evaluateStrategy(buy, 1).stopLoss).toBeCloseTo(99.65));
  it("calculates 1:1", () => expect(evaluateStrategy(buy, 1).targets[0]?.price).toBeCloseTo(100.35));
  it("calculates 1:2", () => expect(evaluateStrategy(buy, 2).targets[1]?.price).toBeCloseTo(100.70));
  it("calculates 1:3", () => expect(evaluateStrategy(buy, 3).targets[2]?.price).toBeCloseTo(101.05));
  it("calculates 1:4", () => expect(evaluateStrategy(buy, 4).targets[3]?.price).toBeCloseTo(101.40));
  it("reverses stop and targets for SELL", () => { const r = evaluateStrategy({ ...buy, h1Close: 85 }, 4); expect(r.stopLoss).toBeCloseTo(100.35); expect(r.targets[3]?.price).toBeCloseTo(98.6); });
  it("rejects ratios outside 1 through 4", () => expect(() => evaluateStrategy(buy, 5 as 1)).toThrow());
});