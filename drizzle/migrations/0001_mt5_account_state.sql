CREATE TABLE public.mt5_account_state (
  id integer PRIMARY KEY CHECK (id = 1),
  bridge_online boolean NOT NULL DEFAULT false,
  platform text,
  account_login text,
  broker_server text,
  currency text NOT NULL DEFAULT 'USD',
  balance numeric,
  equity numeric,
  margin numeric,
  free_margin numeric,
  leverage integer,
  read_only boolean NOT NULL DEFAULT true,
  bridge_version text,
  offline_reason text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Singleton row holding the latest snapshot pushed by the PC-side connector.
INSERT INTO public.mt5_account_state (id) VALUES (1);

GRANT SELECT ON public.mt5_account_state TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_account_state TO service_role;

ALTER TABLE public.mt5_account_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read the MT5 sync state"
  ON public.mt5_account_state
  FOR SELECT
  TO authenticated
  USING (true);