-- Add Stripe Identity verification fields to dealer_applications
ALTER TABLE public.dealer_applications
  ADD COLUMN stripe_verification_session_id TEXT,
  ADD COLUMN verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'unverified', 'requires_input'));
