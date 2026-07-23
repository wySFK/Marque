
CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin()
RETURNS TABLE (user_id UUID, email TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can view user emails';
  END IF;
  RETURN QUERY SELECT id AS user_id, email FROM auth.users;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_emails_for_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_emails_for_admin() TO authenticated;
