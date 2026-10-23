# Chart scanner
- [x] Add strict strategy calculations and rule tests.
- [x] Add secure streamed image analysis and persistent service-error handling.
- [x] Replace random scanner with upload, inputs and result view without moving existing layout.
- [x] Verify tests and actual upload flow.

# MT5 bridge integration (read-only)
- [x] Secure ingest endpoint + MT5 account state table + per-user sign-in.
- [x] Wire MetaTrader tab card to live synced account data.
- [x] PC-side connector package (Docker) for Windows.
- [ ] User: add the MT5_SYNC_SECRET secret in the app (form requested).
- [ ] User: deploy the connector on the PC and verify a real end-to-end sync.
- [ ] Market data display — waiting on the bridge's actual market-data endpoint name (none was provided; do not invent one).
