-- Admin audit log — tracks all sensitive admin actions
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit log entries
CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert audit log entries
CREATE POLICY "Admins can insert audit log"
  ON public.admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log(action);

-- Car status overrides — allows admins to manually override car listing statuses
CREATE TABLE public.car_status_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD')),
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_status_overrides TO authenticated;
GRANT ALL ON public.car_status_overrides TO service_role;
ALTER TABLE public.car_status_overrides ENABLE ROW LEVEL SECURITY;

-- Admins can view all overrides
CREATE POLICY "Admins can view car overrides"
  ON public.car_status_overrides FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage overrides
CREATE POLICY "Admins can manage car overrides"
  ON public.car_status_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER car_status_overrides_set_updated_at
  BEFORE UPDATE ON public.car_status_overrides
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
