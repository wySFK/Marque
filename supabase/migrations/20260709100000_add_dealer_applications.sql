-- Dealer applications — submitted by users who want to become verified dealers
CREATE TABLE public.dealer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  inventory_focus TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

GRANT SELECT, INSERT ON public.dealer_applications TO authenticated;
GRANT ALL ON public.dealer_applications TO service_role;
GRANT SELECT, UPDATE ON public.dealer_applications TO authenticated;
ALTER TABLE public.dealer_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own application
CREATE POLICY "Users can view own application"
  ON public.dealer_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can submit an application (only if they don't already have one)
CREATE POLICY "Users can insert own application"
  ON public.dealer_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.dealer_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON public.dealer_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER dealer_applications_set_updated_at
  BEFORE UPDATE ON public.dealer_applications
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
