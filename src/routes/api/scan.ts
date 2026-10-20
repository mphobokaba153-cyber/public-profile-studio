import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/scan")({
  server: { handlers: { POST: async ({ request }) => { const { handleScanner } = await import("@/lib/scanner.server"); return handleScanner(request); } } },
});