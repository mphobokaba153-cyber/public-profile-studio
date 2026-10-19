# Chart-upload AI scanner

## What changes
- Keep the existing app layout, branding, Home and MetaTrader screens unchanged.
- Replace the random AI Scan results with real analysis of uploaded chart pictures.
- Add a chart preview, pair and timeframe selection, and an automatic or manual 1:1, 1:2, 1:3 or 1:4 profit-target choice.
- Return BUY, SELL or WAIT with visible evidence, entry, stop loss and all four profit targets. No orders will be placed.

## Trading rules
- Follow the actual supplied code, not a generic Quasimodo strategy: compare the current H1 close against the previously stored current-timeframe candle-15 low first, then high. BUY takes precedence when its comparison passes.
- Use the supplied 0.35% stop-loss distance and calculate targets at one, two, three or four times that distance, replacing the source's fixed 0.60% target.
- Screenshots cannot always reveal the source's previously stored levels or live bid/ask. Provide fields for those values when needed; return WAIT rather than inventing missing prices, levels or evidence.
- Exclude the supplied broker-account restriction, copy-trading webhook, account identifiers, branding and execution delays: these are not chart-analysis rules.

## Technical details
- Lovable Cloud powers the server-side AI call; chart pictures are processed for the current scan, not saved publicly.
- Use the verified image-capable default model through the streaming Responses API, with strict structured output and server-side validation of the strategy and target calculations.
- Add concrete tests for BUY-before-SELL precedence, missing evidence, the 0.35% stop loss and each permitted profit ratio.
- Check image upload and analysis in the app; show service errors without fabricated results or automatic retries.