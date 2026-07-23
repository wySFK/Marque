-- Saved / favorited cars
CREATE TABLE public.saved_cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, car_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_cars TO authenticated;
GRANT ALL ON public.saved_cars TO service_role;
ALTER TABLE public.saved_cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved cars"
  ON public.saved_cars FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save cars"
  ON public.saved_cars FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave cars"
  ON public.saved_cars FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Order history
CREATE TABLE public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id TEXT NOT NULL,
  car_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_history TO authenticated;
GRANT ALL ON public.order_history TO service_role;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.order_history FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Bank accounts
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank account"
  ON public.bank_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank account"
  ON public.bank_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank account"
  ON public.bank_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER bank_accounts_set_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
