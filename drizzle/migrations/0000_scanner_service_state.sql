CREATE TABLE public.scanner_service_state (id text PRIMARY KEY, status integer NOT NULL DEFAULT 403, message text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.scanner_service_state TO service_role;
ALTER TABLE public.scanner_service_state ENABLE ROW LEVEL SECURITY;