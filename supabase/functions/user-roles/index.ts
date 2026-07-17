import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // ---- Authenticate the caller via their JWT ----
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client using the caller's JWT — respects RLS
    const userClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Verify the JWT and get the user
    const { data: { user }, error: ue } = await userClient.auth.getUser();
    if (ue || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---- Authorize: fetch the caller's profile and check role ----
    const { data: callerProfile } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const callerRole = (callerProfile?.role || "").toUpperCase();
    if (callerRole !== "SUPER_ADMIN") {
      return new Response(JSON.stringify({ error: "Forbidden: Super Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---- Route by method ----
    const path = new URL(req.url).pathname.replace(/\/$/, "");

    // GET /user-roles — list all profiles for the admin dashboard
    if (req.method === "GET") {
      const adminClient = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await adminClient
        .from("profiles")
        .select("id, email, full_name, phone, role, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ users: data }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // POST /user-roles — change a user's role
    if (req.method === "POST") {
      const { targetUserId, newRole } = await req.json();
      if (!targetUserId || !newRole) {
        return new Response(JSON.stringify({ error: "targetUserId and newRole are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const validRoles = ["USER", "ADMIN", "SUPER_ADMIN"];
      if (!validRoles.includes(String(newRole).toUpperCase())) {
        return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (targetUserId === user.id) {
        return new Response(JSON.stringify({ error: "You cannot change your own role" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Use the service-role client + RPC so the is_admin() check in the
      // function passes (SECURITY DEFINER runs as the owner).
      const adminClient = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error: rpcErr } = await adminClient.rpc("set_user_role", {
        p_target: targetUserId,
        p_role: String(newRole).toUpperCase(),
      });
      if (rpcErr) {
        return new Response(JSON.stringify({ error: rpcErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: true, message: `Role updated to ${newRole}` }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
