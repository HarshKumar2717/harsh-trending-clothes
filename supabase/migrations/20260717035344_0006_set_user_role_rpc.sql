/*
# Secure role-change RPC

## Purpose
A SECURITY DEFINER function that changes a user's role. It enforces:
1. Caller must be SUPER_ADMIN (is_admin() check).
2. Caller cannot change their own role.
3. Role value must be USER, ADMIN, or SUPER_ADMIN.

Called only by the user-roles edge function using the service role key.
The edge function ALSO validates the caller's role before calling this RPC,
providing defense in depth.
*/

CREATE OR REPLACE FUNCTION public.set_user_role(p_target uuid, p_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN: only a Super Admin can change roles';
  END IF;
  IF p_target = auth.uid() THEN
    RAISE EXCEPTION 'FORBIDDEN: you cannot change your own role';
  END IF;
  IF upper(p_role) NOT IN ('USER','ADMIN','SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Invalid role value';
  END IF;
  UPDATE public.profiles SET role = upper(p_role) WHERE id = p_target;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;
