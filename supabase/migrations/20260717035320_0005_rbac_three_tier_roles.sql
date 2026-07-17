/*
# RBAC: Three-tier roles + self-role-change lockdown

## Purpose
Upgrade profiles.role from ('customer','super_admin') to
('USER','ADMIN','SUPER_ADMIN'). Lock the role column at the DB level so a
user can NEVER change their own role — enforced by a BEFORE UPDATE trigger,
not by RLS (NEW/OLD aren't available in RLS policies).

## Changes
1. Drop old CHECK constraint, migrate rows, add new constraint (USER, ADMIN, SUPER_ADMIN).
2. Default role = USER.
3. is_admin() checks upper(role) = 'SUPER_ADMIN'.
4. UPDATE policies: owner may update own row (ownership check only);
   SUPER_ADMIN may update any row. Role immutability enforced by trigger (step 5).
5. BEFORE UPDATE trigger: raises exception if role changes AND caller is not SUPER_ADMIN.
   This is the anti-privilege-escalation guard — a user who sends role:'SUPER_ADMIN'
   in a profile update gets a 403-equivalent DB error.
6. Signup trigger defaults to USER.
*/

-- 1. Drop old constraint, migrate, add new
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE role = 'super_admin';
UPDATE public.profiles SET role = 'USER' WHERE role = 'customer';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('USER','ADMIN','SUPER_ADMIN'));

-- 2. Default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'USER';

-- 3. is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND upper(role) = 'SUPER_ADMIN'
  );
$$;

-- 4. UPDATE policies (ownership only; role lock is via trigger)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. BEFORE UPDATE trigger: block role changes by non-admins
CREATE OR REPLACE FUNCTION public.guard_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN: role can only be changed by a Super Admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role ON public.profiles;
CREATE TRIGGER profiles_guard_role
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_role_change();

-- 6. Signup trigger defaults to USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (NEW.id, NEW.email, 'USER', COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
