import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "admin@harshcloth.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Harsh Admin";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if admin user already exists
    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing?.users?.find((u: any) => u.email === ADMIN_EMAIL);

    let userId: string;
    if (found) {
      userId = found.id;
      // Promote existing profile to super_admin
      await admin.from("profiles").upsert({
        id: userId,
        email: ADMIN_EMAIL,
        role: "super_admin",
        full_name: ADMIN_NAME,
      });
    } else {
      // Create the admin auth user with a confirmed session
      const { data: created, error } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: ADMIN_NAME, role: "super_admin" },
      });
      if (error) throw error;
      userId = created.user.id;
      // Upsert the profile as super_admin (trigger may have already created it as customer)
      await admin.from("profiles").upsert({
        id: userId,
        email: ADMIN_EMAIL,
        role: "super_admin",
        full_name: ADMIN_NAME,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, email: ADMIN_EMAIL, id: userId, message: "Super admin ready. Login with admin@harshcloth.com / Admin@123" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
