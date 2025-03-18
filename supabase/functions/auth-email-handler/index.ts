
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get site URL from environment or use a default
    const siteUrl = Deno.env.get("SITE_URL") || window.location.origin;
    
    console.log(`Processing auth action: ${action} for email: ${email}`);

    if (action === "resend-confirmation") {
      // Get user by email
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      
      if (userError) {
        console.error("Error getting user:", userError);
        return new Response(JSON.stringify({ 
          error: "User not found" 
        }), { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // Resend confirmation email with proper redirect
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        options: {
          redirectTo: `${siteUrl}/auth?confirmation=true`,
        }
      });

      if (error) {
        console.error("Error resending confirmation:", error);
        return new Response(JSON.stringify({ 
          error: error.message 
        }), { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Confirmation email resent" 
      }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    return new Response(JSON.stringify({ 
      error: "Invalid action" 
    }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
