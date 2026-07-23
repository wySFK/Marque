-- Track when an application has been re-submitted after rejection
ALTER TABLE public.dealer_applications
  ADD COLUMN resubmitted_at TIMESTAMPTZ;

-- Allow users to update their own resubmitted_at on re-apply
-- (already covered by existing RLS policy for INSERT/UPDATE on own application)
