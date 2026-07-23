-- Add rejection reason column to dealer_applications
ALTER TABLE public.dealer_applications
  ADD COLUMN rejection_reason TEXT;
